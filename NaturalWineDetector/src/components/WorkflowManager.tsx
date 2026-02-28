import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WineAnalysisResult, LocationData, WineRecord } from '../types/WineTypes';

interface WorkflowState {
  currentStep: 'camera' | 'analysis' | 'logging' | 'history' | 'detail';
  imageUri?: string;
  capturedLocation?: LocationData;
  analysisResult?: WineAnalysisResult;
  selectedWine?: WineRecord;
  isTransitioning: boolean;
}

interface WorkflowContextType {
  state: WorkflowState;
  actions: {
    startAnalysis: (imageUri: string, location?: LocationData) => void;
    completeAnalysis: (result: WineAnalysisResult) => void;
    startLogging: () => void;
    completeLogging: (wineRecord: WineRecord) => void;
    viewHistory: () => void;
    viewWineDetail: (wine: WineRecord) => void;
    returnToCamera: () => void;
    setTransitioning: (transitioning: boolean) => void;
    clearWorkflow: () => void;
  };
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

const initialState: WorkflowState = {
  currentStep: 'camera',
  isTransitioning: false,
};

interface WorkflowManagerProps {
  children: ReactNode;
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({ children }) => {
  const [state, setState] = useState<WorkflowState>(initialState);

  const actions = {
    startAnalysis: (imageUri: string, location?: LocationData) => {
      setState(prev => ({
        ...prev,
        currentStep: 'analysis',
        imageUri,
        capturedLocation: location,
        analysisResult: undefined,
      }));
    },

    completeAnalysis: (result: WineAnalysisResult) => {
      setState(prev => ({
        ...prev,
        analysisResult: result,
      }));
    },

    startLogging: () => {
      setState(prev => ({
        ...prev,
        currentStep: 'logging',
      }));
    },

    completeLogging: (_wineRecord: WineRecord) => {
      setState(prev => ({
        ...prev,
        currentStep: 'history',
        // Clear workflow data after successful save
        imageUri: undefined,
        capturedLocation: undefined,
        analysisResult: undefined,
      }));
    },

    viewHistory: () => {
      setState(prev => ({
        ...prev,
        currentStep: 'history',
      }));
    },

    viewWineDetail: (wine: WineRecord) => {
      setState(prev => ({
        ...prev,
        currentStep: 'detail',
        selectedWine: wine,
      }));
    },

    returnToCamera: () => {
      setState(prev => ({
        ...prev,
        currentStep: 'camera',
        imageUri: undefined,
        capturedLocation: undefined,
        analysisResult: undefined,
        selectedWine: undefined,
      }));
    },

    setTransitioning: (transitioning: boolean) => {
      setState(prev => ({
        ...prev,
        isTransitioning: transitioning,
      }));
    },

    clearWorkflow: () => {
      setState(initialState);
    },
  };

  return (
    <WorkflowContext.Provider value={{ state, actions }}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = (): WorkflowContextType => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowManager');
  }
  return context;
};

/**
 * Hook to validate workflow state transitions
 */
export const useWorkflowValidation = () => {
  const { state } = useWorkflow();

  const validateTransition = (
    from: WorkflowState['currentStep'],
    to: WorkflowState['currentStep']
  ): boolean => {
    const validTransitions: Record<string, string[]> = {
      camera: ['analysis', 'history'],
      analysis: ['logging', 'camera'],
      logging: ['history', 'camera'],
      history: ['detail', 'camera'],
      detail: ['history', 'camera'],
    };

    return validTransitions[from]?.includes(to) ?? false;
  };

  const canProceedToAnalysis = (): boolean => {
    return state.currentStep === 'camera' && !!state.imageUri;
  };

  const canProceedToLogging = (): boolean => {
    return state.currentStep === 'analysis' && !!state.analysisResult;
  };

  const canViewDetail = (): boolean => {
    return state.currentStep === 'history' && !!state.selectedWine;
  };

  return {
    validateTransition,
    canProceedToAnalysis,
    canProceedToLogging,
    canViewDetail,
    currentStep: state.currentStep,
    isTransitioning: state.isTransitioning,
  };
};