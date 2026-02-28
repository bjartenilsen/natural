/**
 * Hook for using network state in React components
 */
import { useState, useEffect } from 'react';
import { NetworkState } from '../types/ErrorTypes';
import { NetworkService } from '../services/NetworkService';

export const useNetworkState = () => {
  const [networkState, setNetworkState] = useState<NetworkState>(
    NetworkService.getInstance().getCurrentState()
  );

  useEffect(() => {
    const networkService = NetworkService.getInstance();
    const unsubscribe = networkService.addListener(setNetworkState);

    return unsubscribe;
  }, []);

  return {
    networkState,
    isOnline: networkState.isConnected && networkState.isInternetReachable,
    isOffline: !networkState.isConnected || !networkState.isInternetReachable
  };
};
