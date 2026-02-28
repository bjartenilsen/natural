// App constants
export const APP_NAME = 'Natural Wine Detector';
export const DATABASE_NAME = 'natural_wine_detector.db';
export const DATABASE_VERSION = 1;

// API Configuration
export const API_CONFIG = {
  OPENAI_BASE_URL: 'https://api.openai.com/v1',
  CHAT_COMPLETIONS_ENDPOINT: '/chat/completions',
  MODEL: 'gpt-4o',
  MAX_TOKENS: 500,
  TEMPERATURE: 0.1,
  TIMEOUT: 30000, // 30 seconds
} as const;

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY: 1000, // 1 second
  MAX_DELAY: 10000, // 10 seconds
  BACKOFF_FACTOR: 2,
} as const;

// Rate Limiting
export const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: 10,
  COOLDOWN_PERIOD: 60000, // 1 minute
} as const;