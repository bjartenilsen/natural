import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useWorkflow } from './WorkflowManager';

interface WorkflowStatusProps {
  showProgress?: boolean;
  position?: 'top' | 'bottom';
}

export const WorkflowStatus: React.FC<WorkflowStatusProps> = ({
  showProgress = true,
  position = 'top',
}) => {
  const { state } = useWorkflow();

  if (!showProgress) {
    return null;
  }

  const getStepInfo = () => {
    switch (state.currentStep) {
      case 'camera':
        return { title: 'Take Photo', progress: 1, total: 4, icon: '📷' };
      case 'analysis':
        return { title: 'Analyzing Wine', progress: 2, total: 4, icon: '🔍' };
      case 'logging':
        return { title: 'Log Experience', progress: 3, total: 4, icon: '📝' };
      case 'history':
        return { title: 'Wine History', progress: 4, total: 4, icon: '📚' };
      case 'detail':
        return { title: 'Wine Details', progress: 4, total: 4, icon: '🍷' };
      default:
        return { title: 'Natural Wine Detector', progress: 1, total: 4, icon: '🍇' };
    }
  };

  const stepInfo = getStepInfo();
  const progressPercentage = (stepInfo.progress / stepInfo.total) * 100;

  return (
    <View style={[
      styles.container,
      position === 'bottom' && styles.containerBottom
    ]}>
      <View style={styles.content}>
        <View style={styles.stepInfo}>
          <Text style={styles.icon}>{stepInfo.icon}</Text>
          <Text style={styles.title}>{stepInfo.title}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {stepInfo.progress}/{stepInfo.total}
          </Text>
        </View>
      </View>
      
      {state.isTransitioning && (
        <View style={styles.transitionIndicator}>
          <View style={styles.transitionDot} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(107, 70, 193, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  containerBottom: {
    borderBottomWidth: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 30,
    textAlign: 'center',
  },
  transitionIndicator: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -4,
  },
  transitionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
});