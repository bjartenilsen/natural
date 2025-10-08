// Location hook - placeholder for future implementation
import { useState } from 'react';
import { LocationData } from '../types';

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async (): Promise<void> => {
    // Placeholder implementation
    setLoading(true);
    // Implementation will be added in future tasks
    setLoading(false);
  };

  return { location, loading, getCurrentLocation };
};