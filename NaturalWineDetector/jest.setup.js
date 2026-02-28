// Global test setup
// Add any global mocks or setup here

// Mock __DEV__ global
global.__DEV__ = true;

// Silence console warnings in tests
jest.spyOn(console, 'warn').mockImplementation(() => {});
