// Wine-related type definitions - placeholder for future implementation
export interface WineRecord {
  id: string;
  imageUri: string;
  isNaturalWine: boolean;
  confidenceScore: number;
  explanation: string;
  consumed: boolean;
  location?: LocationData;
  notes?: string;
  createdAt: Date;
  analysisTimestamp: Date;
}

export interface WineAnalysisResult {
  isNaturalWine: boolean;
  confidenceScore: number;
  explanation: string;
  timestamp: Date;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}