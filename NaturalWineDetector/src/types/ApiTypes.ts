/**
 * API-related type definitions for external service integrations
 */

import { WineAnalysisResult } from './WineTypes';

/**
 * ChatGPT API request structure
 */
export interface ChatGPTRequest {
  model: string;
  messages: ChatGPTMessage[];
  max_tokens?: number;
  temperature?: number;
}

/**
 * ChatGPT message structure
 */
export interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ChatGPTContent[];
}

/**
 * ChatGPT content for multimodal requests (text + image)
 */
export interface ChatGPTContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

/**
 * ChatGPT API response structure
 */
export interface ChatGPTResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatGPTChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * ChatGPT choice structure
 */
export interface ChatGPTChoice {
  index: number;
  message: ChatGPTMessage;
  finish_reason: string;
}

/**
 * Parsed wine analysis from ChatGPT response
 */
export interface ParsedWineAnalysis {
  isNaturalWine: boolean;
  confidenceScore: number;
  explanation: string;
}

/**
 * API configuration
 */
export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

/**
 * API retry configuration
 */
export interface ApiRetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

/**
 * Image processing configuration for API calls
 */
export interface ImageProcessingConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'JPEG' | 'PNG' | 'WEBP';
  maxSizeBytes: number;
}