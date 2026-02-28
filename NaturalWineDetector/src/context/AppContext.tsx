/**
 * Global application context with state management
 */
import React, { createContext, useContext, useReducer, useRef, ReactNode, useEffect } from 'react';
import { AppState, AppAction } from '../types/AppTypes';
import { WineRecord } from '../types/WineTypes';
import { initializeDatabase } from '../repositories/DatabaseInitializer';
import { WineRepository } from '../repositories/WineRepository';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | undefined) => void;
    loadWines: () => Promise<void>;
    addWine: (wine: WineRecord) => void;
    setCurrentAnalysis: (analysis: any) => void;
    clearCurrentAnalysis: () => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * App state reducer
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_WINES':
      return { ...state, wines: action.payload };
    
    case 'ADD_WINE':
      return { 
        ...state, 
        wines: [action.payload, ...state.wines] 
      };
    
    case 'SET_CURRENT_ANALYSIS':
      return { ...state, currentAnalysis: action.payload };
    
    case 'CLEAR_CURRENT_ANALYSIS':
      return { ...state, currentAnalysis: undefined };
    
    default:
      return state;
  }
}

/**
 * Initial app state
 */
const initialState: AppState = {
  wines: [],
  loading: false,
  error: undefined,
  currentAnalysis: undefined,
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const wineRepository = useRef(new WineRepository()).current;

  // Action creators
  const actions = {
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },

    setError: (error: string | undefined) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },

    loadWines: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: undefined });
        
        const wines = await wineRepository.getAllWines();
        dispatch({ type: 'SET_WINES', payload: wines });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load wines';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    addWine: (wine: WineRecord) => {
      dispatch({ type: 'ADD_WINE', payload: wine });
    },

    setCurrentAnalysis: (analysis: any) => {
      dispatch({ type: 'SET_CURRENT_ANALYSIS', payload: analysis });
    },

    clearCurrentAnalysis: () => {
      dispatch({ type: 'CLEAR_CURRENT_ANALYSIS' });
    },
  };

  // Initialize database and load wines on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Initialize database
        await initializeDatabase();
        
        // Load existing wines
        await actions.loadWines();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize app';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
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