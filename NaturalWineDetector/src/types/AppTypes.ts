// App-related type definitions - placeholder for future implementation
import { WineRecord, WineAnalysisResult } from './WineTypes';

export interface AppState {
  wines: WineRecord[];
  currentAnalysis?: WineAnalysisResult;
  loading: boolean;
  error?: string;
}