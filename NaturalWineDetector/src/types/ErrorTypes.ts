// Error-related type definitions - placeholder for future implementation
export interface AppError {
  type: 'network' | 'permission' | 'storage' | 'image' | 'api';
  message: string;
  recoverable: boolean;
  retryAction?: () => void;
}