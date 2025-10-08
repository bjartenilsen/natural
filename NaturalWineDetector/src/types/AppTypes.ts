/**
 * Application state and UI-related type definitions
 */

import { WineRecord, WineAnalysisResult, LocationData } from './WineTypes';

/**
 * Global application state
 */
export interface AppState {
  wines: WineRecord[];
  currentAnalysis?: WineAnalysisResult;
  loading: boolean;
  error?: string;
}

/**
 * Actions for app state management
 */
export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_WINES'; payload: WineRecord[] }
  | { type: 'ADD_WINE'; payload: WineRecord }
  | { type: 'SET_CURRENT_ANALYSIS'; payload: WineAnalysisResult | undefined }
  | { type: 'CLEAR_CURRENT_ANALYSIS' };

/**
 * Loading states for different operations
 */
export interface LoadingState {
  analyzing: boolean;
  saving: boolean;
  loading: boolean;
}

/**
 * Navigation parameters for different screens
 */
export type RootStackParamList = {
  Camera: undefined;
  Analysis: {
    imageUri: string;
    location?: LocationData;
  };
  WineLogging: {
    analysisResult: WineAnalysisResult;
    imageUri: string;
    capturedLocation?: LocationData;
  };
  History: undefined;
  WineDetail: {
    wineId: string;
  };
  Permissions: undefined;
};

/**
 * Component prop types
 */
export interface CameraComponentProps {
  onImageCaptured: (imageUri: string, location?: LocationData) => void;
  onError: (error: string) => void;
}

export interface WineAnalysisProps {
  imageUri: string;
  location?: LocationData;
  onAnalysisComplete: (result: WineAnalysisResult) => void;
  onError: (error: string) => void;
}

export interface WineLoggingProps {
  analysisResult: WineAnalysisResult;
  imageUri: string;
  capturedLocation?: LocationData;
  onSave: (wineRecord: WineRecord) => void;
  onError: (error: string) => void;
}

export interface WineHistoryProps {
  wines: WineRecord[];
  onWineSelect: (wine: WineRecord) => void;
  onRefresh: () => void;
  loading: boolean;
}