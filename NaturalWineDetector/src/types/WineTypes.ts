/**
 * Core wine-related type definitions for the Natural Wine Detector app
 */

/**
 * Location data captured during photo taking
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

/**
 * Result from ChatGPT wine analysis
 */
export interface WineAnalysisResult {
  isNaturalWine: boolean;
  confidenceScore: number; // 0-100
  explanation: string;
  timestamp: Date;
}

/**
 * Complete wine record stored in database
 */
export interface WineRecord {
  id: string;
  imageUri: string;
  analysisResult: WineAnalysisResult;
  consumed: boolean;
  location?: LocationData; // Location where photo was taken
  notes?: string;
  createdAt: Date;
}

/**
 * Database row structure for wine records
 * Used for SQLite operations with snake_case column names
 */
export interface WineRecordRow {
  id: string;
  image_uri: string;
  is_natural_wine: number; // SQLite boolean as integer
  confidence_score: number;
  explanation: string;
  consumed: number; // SQLite boolean as integer
  latitude?: number;
  longitude?: number;
  location_accuracy?: number;
  notes?: string;
  created_at: string; // ISO string for SQLite
  analysis_timestamp: string; // ISO string for SQLite
}