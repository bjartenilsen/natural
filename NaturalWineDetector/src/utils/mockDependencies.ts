/**
 * Mock dependencies for development when packages are not installed
 */

// Mock NetInfo for development
export const mockNetInfo = {
  fetch: () => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    details: {}
  }),
  addEventListener: (callback: any) => {
    // Return unsubscribe function
    return () => {};
  }
};

// Mock AsyncStorage for development
export const mockAsyncStorage = {
  getItem: (key: string) => Promise.resolve(null),
  setItem: (key: string, value: string) => Promise.resolve(),
  removeItem: (key: string) => Promise.resolve(),
  clear: () => Promise.resolve(),
  getAllKeys: () => Promise.resolve([]),
  multiGet: (keys: string[]) => Promise.resolve([]),
  multiSet: (keyValuePairs: [string, string][]) => Promise.resolve(),
  multiRemove: (keys: string[]) => Promise.resolve()
};