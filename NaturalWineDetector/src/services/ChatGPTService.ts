import axios, { AxiosResponse } from 'axios';
import { WineAnalysisResult } from '../types/WineTypes';
import { 
  ChatGPTRequest, 
  ChatGPTResponse, 
  ParsedWineAnalysis,
  ApiRetryConfig,
  ApiConfig 
} from '../types/ApiTypes';
import { ApiError } from '../types/ErrorTypes';
import { API_CONFIG, RETRY_CONFIG, RATE_LIMIT_CONFIG } from '../utils/constants';
import { processImageForApi, imageToBase64, validateImageComplete } from '../utils/imageUtils';
import { ApiKeyService, ApiUsageData } from './ApiKeyService';
import { ErrorHandler } from '../utils/errorHandler';
import { isAppErrorOfType } from '../utils/typeGuards';
import { NetworkService } from './NetworkService';
import { OfflineQueueService } from './OfflineQueueService';

/**
 * Service for integrating with OpenAI's ChatGPT API for wine image analysis
 */
export class ChatGPTService {
  private static requestCount = 0;
  private static lastRequestTime = 0;
  private static rateLimitResetTime = 0;

  /**
   * Initialize the service by loading API key from secure storage
   * @returns Promise<boolean> - True if API key is available
   */
  static async initialize(): Promise<boolean> {
    try {
      const apiKey = await ApiKeyService.getApiKey();
      return !!apiKey;
    } catch (error) {
      console.error('Failed to initialize ChatGPT service:', error);
      return false;
    }
  }

  /**
   * Set the OpenAI API key and store it securely
   * @param key - OpenAI API key
   * @returns Promise<void>
   */
  static async setApiKey(key: string): Promise<void> {
    await ApiKeyService.storeApiKey(key);
  }

  /**
   * Get the current API key from secure storage
   * @returns Promise<string | null> - Current API key or null if not set
   */
  static async getApiKey(): Promise<string | null> {
    return await ApiKeyService.getApiKey();
  }

  /**
   * Check if API key is configured
   * @returns Promise<boolean> - True if API key is set
   */
  static async isConfigured(): Promise<boolean> {
    return await ApiKeyService.hasApiKey();
  }

  /**
   * Remove API key from secure storage
   * @returns Promise<void>
   */
  static async removeApiKey(): Promise<void> {
    await ApiKeyService.removeApiKey();
  }

  /**
   * Analyze wine image using ChatGPT Vision API
   * @param imageUri - Local file URI of the wine image
   * @param onOfflineQueued - Callback when request is queued for offline processing
   * @returns Promise<WineAnalysisResult> - Analysis result with confidence score
   */
  static async analyzeWineImage(
    imageUri: string, 
    onOfflineQueued?: (queueId: string) => void
  ): Promise<WineAnalysisResult> {
    const isConfigured = await this.isConfigured();
    if (!isConfigured) {
      throw ErrorHandler.createApiError({
        message: 'OpenAI API key not configured',
        recoverable: false,
        timestamp: new Date(),
        apiEndpoint: 'chat/completions',
      });
    }

    // Check network connectivity
    const networkService = NetworkService.getInstance();
    if (networkService.isOffline()) {
      // Queue request for when connectivity returns
      const base64Image = await imageToBase64(imageUri);
      const queueService = OfflineQueueService.getInstance();
      
      const queueId = await queueService.addToQueue('api_request', {
        type: 'wine_analysis',
        imageBase64: base64Image,
        originalImageUri: imageUri,
        timestamp: new Date().toISOString()
      });

      if (onOfflineQueued) {
        onOfflineQueued(queueId);
      }

      throw ErrorHandler.createNetworkError({
        message: 'No internet connection. Your request has been queued and will be processed when connectivity returns.',
        recoverable: true,
        timestamp: new Date(),
        isOffline: true,
        context: { queueId }
      });
    }

    // Check daily usage limits
    const isDailyLimitExceeded = await ApiKeyService.isDailyLimitExceeded();
    if (isDailyLimitExceeded) {
      const remainingRequests = await ApiKeyService.getRemainingRequests();
      throw ErrorHandler.createApiError({
        message: `Daily API usage limit exceeded. ${remainingRequests} requests remaining.`,
        recoverable: false,
        timestamp: new Date(),
        apiEndpoint: 'rate-limit',
        rateLimited: true,
      });
    }

    try {
      // Validate image before processing
      const validation = await validateImageComplete(imageUri);
      if (!validation.isValid) {
        throw ErrorHandler.createImageError({
          message: validation.error || 'Invalid image format or size',
          recoverable: false,
          timestamp: new Date(),
          reason: 'invalid_format',
        });
      }

      // Check rate limiting
      this.checkRateLimit();

      // Compress and convert image
      const processedResult = await processImageForApi(imageUri);
      const base64Image = await imageToBase64(processedResult.uri);

      // Perform analysis with retry logic
      const analysis = await this.performAnalysisWithRetry(base64Image);

      // Update rate limiting counters and usage tracking
      this.updateRateLimit();
      await this.trackApiUsage(analysis);

      return {
        isNaturalWine: analysis.isNaturalWine,
        confidenceScore: analysis.confidenceScore,
        explanation: analysis.explanation,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Wine analysis failed:', error);
      
      // If it's already an ApiError, re-throw it
      if (isAppErrorOfType(error, 'api')) {
        throw error;
      }

      throw ErrorHandler.createApiError({
        message: 'Failed to analyze wine image',
        recoverable: true,
        timestamp: new Date(),
        apiEndpoint: 'chat/completions',
        context: { originalError: (error as Error)?.message },
      });
    }
  }

  /**
   * Perform wine analysis with exponential backoff retry logic
   * @param base64Image - Base64 encoded image
   * @returns Promise<ParsedWineAnalysis> - Parsed analysis result
   */
  private static async performAnalysisWithRetry(
    base64Image: string
  ): Promise<ParsedWineAnalysis> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= RETRY_CONFIG.MAX_ATTEMPTS; attempt++) {
      try {
        return await this.callChatGPTAPI(base64Image);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error as Error)) {
          throw error;
        }

        // Calculate delay for exponential backoff
        if (attempt < RETRY_CONFIG.MAX_ATTEMPTS) {
          const delay = Math.min(
            RETRY_CONFIG.BASE_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, attempt - 1),
            RETRY_CONFIG.MAX_DELAY
          );
          
          console.log(`Retry attempt ${attempt} failed, waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    throw ErrorHandler.createApiError({
      message: `Failed after ${RETRY_CONFIG.MAX_ATTEMPTS} attempts`,
      recoverable: false,
      timestamp: new Date(),
      apiEndpoint: 'chat/completions',
      context: { lastError: lastError?.message },
    });
  }

  /**
   * Make the actual API call to ChatGPT
   * @param base64Image - Base64 encoded image
   * @returns Promise<ParsedWineAnalysis> - Parsed analysis result
   */
  private static async callChatGPTAPI(base64Image: string): Promise<ParsedWineAnalysis> {
    const apiKey = await this.getApiKey();
    const request: ChatGPTRequest = {
      model: API_CONFIG.MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert sommelier specializing in natural wines. Analyze the wine bottle image and determine if it's a natural wine based on visual cues like:
          - Producer/winery known for natural wines
          - Minimal or rustic labeling typical of natural wines
          - Organic/biodynamic certifications
          - Cloudy appearance (if visible through bottle)
          - Traditional or artisanal packaging
          
          Respond with a JSON object containing:
          - "isNaturalWine": boolean
          - "confidenceScore": number (0-100)
          - "explanation": string (brief explanation of your assessment)
          
          Be conservative in your assessment - only mark as natural wine if you have strong visual indicators.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this wine bottle image and determine if it\'s a natural wine.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: API_CONFIG.MAX_TOKENS,
      temperature: API_CONFIG.TEMPERATURE,
    };

    const response: AxiosResponse<ChatGPTResponse> = await axios.post(
      `${API_CONFIG.OPENAI_BASE_URL}${API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`,
      request,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: API_CONFIG.TIMEOUT,
      }
    );

    return this.parseAnalysisResponse(response.data);
  }

  /**
   * Parse ChatGPT response into structured analysis result
   * @param response - ChatGPT API response
   * @returns ParsedWineAnalysis - Parsed analysis data
   */
  private static parseAnalysisResponse(response: ChatGPTResponse): ParsedWineAnalysis {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in ChatGPT response');
      }

      // Handle both string and array content types
      const contentText = typeof content === 'string' ? content : JSON.stringify(content);

      // Try to extract JSON from the response
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in ChatGPT response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (typeof parsed.isNaturalWine !== 'boolean') {
        throw new Error('Invalid isNaturalWine field in response');
      }

      if (typeof parsed.confidenceScore !== 'number' || 
          parsed.confidenceScore < 0 || 
          parsed.confidenceScore > 100) {
        throw new Error('Invalid confidenceScore field in response');
      }

      if (typeof parsed.explanation !== 'string') {
        throw new Error('Invalid explanation field in response');
      }

      return {
        isNaturalWine: parsed.isNaturalWine,
        confidenceScore: Math.round(parsed.confidenceScore),
        explanation: parsed.explanation.trim(),
      };
    } catch (error) {
      console.error('Failed to parse ChatGPT response:', error);
      throw ErrorHandler.createApiError({
        message: 'Failed to parse analysis response',
        recoverable: false,
        timestamp: new Date(),
        apiEndpoint: 'chat/completions',
        context: { parseError: (error as Error)?.message },
      });
    }
  }

  /**
   * Check if an error should not be retried
   * @param error - Error to check
   * @returns boolean - True if error should not be retried
   */
  private static isNonRetryableError(error: Error): boolean {
    // Check for specific error conditions that shouldn't be retried
    const errorMessage = error.message.toLowerCase();
    
    // Authentication errors
    if (errorMessage.includes('unauthorized') || errorMessage.includes('invalid api key')) {
      return true;
    }

    // Rate limiting (should be handled by rate limit logic)
    if (errorMessage.includes('rate limit')) {
      return true;
    }

    // Invalid request format
    if (errorMessage.includes('bad request') || errorMessage.includes('invalid request')) {
      return true;
    }

    return false;
  }

  /**
   * Check rate limiting before making API call
   */
  private static checkRateLimit(): void {
    const now = Date.now();
    
    // Reset counter if cooldown period has passed
    if (now - this.rateLimitResetTime > RATE_LIMIT_CONFIG.COOLDOWN_PERIOD) {
      this.requestCount = 0;
      this.rateLimitResetTime = now;
    }

    // Check if we've exceeded rate limit
    if (this.requestCount >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE) {
      const waitTime = RATE_LIMIT_CONFIG.COOLDOWN_PERIOD - (now - this.rateLimitResetTime);
      throw ErrorHandler.createApiError({
        message: `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
        recoverable: true,
        timestamp: new Date(),
        apiEndpoint: 'rate-limit',
        rateLimited: true,
      });
    }
  }

  /**
   * Update rate limiting counters after successful request
   */
  private static updateRateLimit(): void {
    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  /**
   * Sleep for specified milliseconds
   * @param ms - Milliseconds to sleep
   * @returns Promise<void>
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => global.setTimeout(resolve, ms));
  }

  /**
   * Track API usage for monitoring and rate limiting
   * @param analysis - Analysis result containing token usage info
   */
  private static async trackApiUsage(analysis: ParsedWineAnalysis): Promise<void> {
    try {
      const usageData: ApiUsageData = {
        totalRequests: 1,
        totalTokens: 0, // We don't get token info from our simplified response
        lastRequestTime: new Date().toISOString(),
        dailyRequests: {},
        tokensUsed: 0,
      };
      
      await ApiKeyService.storeUsageData(usageData);
    } catch (error) {
      console.error('Failed to track API usage:', error);
      // Don't throw error for usage tracking failures
    }
  }

  /**
   * Get current rate limit status
   * @returns Object with rate limit information
   */
  static getRateLimitStatus(): {
    requestCount: number;
    resetTime: number;
    canMakeRequest: boolean;
  } {
    const now = Date.now();
    const canMakeRequest = this.requestCount < RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE || (now - this.rateLimitResetTime >= RATE_LIMIT_CONFIG.COOLDOWN_PERIOD);
    
    return {
      requestCount: this.requestCount,
      resetTime: this.rateLimitResetTime,
      canMakeRequest,
    };
  }

  /**
   * Get API usage statistics
   * @returns Promise<ApiUsageData | null> - Usage statistics
   */
  static async getUsageStatistics(): Promise<ApiUsageData | null> {
    return await ApiKeyService.getUsageData();
  }

  /**
   * Get remaining API requests for today
   * @returns Promise<number> - Number of remaining requests
   */
  static async getRemainingRequests(): Promise<number> {
    return await ApiKeyService.getRemainingRequests();
  }

  /**
   * Reset usage statistics
   * @returns Promise<void>
   */
  static async resetUsageStatistics(): Promise<void> {
    await ApiKeyService.resetUsageData();
  }
}