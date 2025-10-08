/**
 * Utility functions for converting between TypeScript interfaces and database rows
 */

import { WineRecord, WineRecordRow, WineAnalysisResult, LocationData } from '../types/WineTypes';

/**
 * Convert a WineRecord to a database row format
 */
export function wineRecordToRow(wine: WineRecord): WineRecordRow {
  return {
    id: wine.id,
    image_uri: wine.imageUri,
    is_natural_wine: wine.analysisResult.isNaturalWine ? 1 : 0,
    confidence_score: wine.analysisResult.confidenceScore,
    explanation: wine.analysisResult.explanation,
    consumed: wine.consumed ? 1 : 0,
    latitude: wine.location?.latitude,
    longitude: wine.location?.longitude,
    location_accuracy: wine.location?.accuracy,
    notes: wine.notes,
    created_at: wine.createdAt.toISOString(),
    analysis_timestamp: wine.analysisResult.timestamp.toISOString()
  };
}

/**
 * Convert a database row to a WineRecord
 */
export function rowToWineRecord(row: WineRecordRow): WineRecord {
  const analysisResult: WineAnalysisResult = {
    isNaturalWine: row.is_natural_wine === 1,
    confidenceScore: row.confidence_score,
    explanation: row.explanation,
    timestamp: new Date(row.analysis_timestamp)
  };

  let location: LocationData | undefined;
  if (row.latitude !== undefined && row.longitude !== undefined && row.location_accuracy !== undefined) {
    location = {
      latitude: row.latitude,
      longitude: row.longitude,
      accuracy: row.location_accuracy
    };
  }

  return {
    id: row.id,
    imageUri: row.image_uri,
    analysisResult,
    consumed: row.consumed === 1,
    location,
    notes: row.notes,
    createdAt: new Date(row.created_at)
  };
}

/**
 * Validate wine record data before database operations
 */
export function validateWineRecord(wine: WineRecord): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate required fields
  if (!wine.id || wine.id.trim() === '') {
    errors.push('Wine ID is required');
  }

  if (!wine.imageUri || wine.imageUri.trim() === '') {
    errors.push('Image URI is required');
  }

  if (!wine.analysisResult) {
    errors.push('Analysis result is required');
  } else {
    // Validate analysis result
    if (typeof wine.analysisResult.isNaturalWine !== 'boolean') {
      errors.push('Analysis result must specify if wine is natural');
    }

    if (typeof wine.analysisResult.confidenceScore !== 'number' || 
        wine.analysisResult.confidenceScore < 0 || 
        wine.analysisResult.confidenceScore > 100) {
      errors.push('Confidence score must be a number between 0 and 100');
    }

    if (!wine.analysisResult.explanation || wine.analysisResult.explanation.trim() === '') {
      errors.push('Analysis explanation is required');
    }

    if (!(wine.analysisResult.timestamp instanceof Date) || isNaN(wine.analysisResult.timestamp.getTime())) {
      errors.push('Analysis timestamp must be a valid Date');
    }
  }

  if (typeof wine.consumed !== 'boolean') {
    errors.push('Consumed status must be a boolean');
  }

  if (!(wine.createdAt instanceof Date) || isNaN(wine.createdAt.getTime())) {
    errors.push('Created at must be a valid Date');
  }

  // Validate optional location data
  if (wine.location) {
    if (typeof wine.location.latitude !== 'number' || 
        wine.location.latitude < -90 || 
        wine.location.latitude > 90) {
      errors.push('Latitude must be a number between -90 and 90');
    }

    if (typeof wine.location.longitude !== 'number' || 
        wine.location.longitude < -180 || 
        wine.location.longitude > 180) {
      errors.push('Longitude must be a number between -180 and 180');
    }

    if (typeof wine.location.accuracy !== 'number' || wine.location.accuracy < 0) {
      errors.push('Location accuracy must be a positive number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a unique ID for wine records
 */
export function generateWineId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `wine_${timestamp}_${randomPart}`;
}

/**
 * Sanitize SQL input to prevent injection attacks
 */
export function sanitizeSqlInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove or escape potentially dangerous characters
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .trim();
}