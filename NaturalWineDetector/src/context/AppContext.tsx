// App context - placeholder for future implementation
import React, { createContext, useContext, ReactNode } from 'react';
import { AppState } from '../types';

interface AppContextType {
  state: AppState;
  dispatch: (action: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Placeholder implementation
  const state: AppState = {
    wines: [],
    loading: false,
  };

  const dispatch = (action: any): void => {
    // Placeholder implementation
    console.log('Action dispatched:', action);
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};