/**
 * Custom hook for performance monitoring and memory management
 * Provides reactive performance metrics and memory usage information
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { PerformanceMonitor, PerformanceStats } from '../utils/PerformanceMonitor';
import { MemoryManager, MemoryInfo } from '../utils/MemoryManager';

interface UsePerformanceMonitorReturn {
  // Performance metrics
  performanceStats: PerformanceStats[];
  activeOperations: number;
  slowOperations: number;
  averageResponseTime: number;
  
  // Memory information
  memoryInfo: MemoryInfo | null;
  memoryPressure: 'low' | 'medium' | 'high';
  cacheStats: {
    imageCount: number;
    totalSize: number;
    oldestTimestamp: number;
    newestTimestamp: number;
  };
  
  // Control methods
  clearPerformanceMetrics: () => void;
  clearMemoryCache: () => Promise<void>;
  performCleanup: () => Promise<void>;
  logPerformanceSummary: () => void;
  
  // Monitoring state
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

export const usePerformanceMonitor = (
  autoStart = true,
  updateInterval = 5000 // 5 seconds
): UsePerformanceMonitorReturn => {
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats[]>([]);
  const [activeOperations, setActiveOperations] = useState(0);
  const [slowOperations, setSlowOperations] = useState(0);
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);
  const [memoryPressure, setMemoryPressure] = useState<'low' | 'medium' | 'high'>('low');
  const [cacheStats, setCacheStats] = useState({
    imageCount: 0,
    totalSize: 0,
    oldestTimestamp: 0,
    newestTimestamp: 0,
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const memoryWarningCallbackRef = useRef<((info: MemoryInfo) => void) | null>(null);

  /**
   * Update performance metrics
   */
  const updateMetrics = useCallback(async () => {
    try {
      // Update performance stats
      const stats = PerformanceMonitor.getAllStats();
      setPerformanceStats(stats);
      
      // Update performance summary
      const summary = PerformanceMonitor.getPerformanceSummary();
      setActiveOperations(summary.activeOperations);
      setSlowOperations(summary.slowOperations);
      setAverageResponseTime(summary.averageResponseTime);
      
      // Update memory info
      const memInfo = await MemoryManager.getMemoryInfo();
      setMemoryInfo(memInfo);
      setMemoryPressure(memInfo.memoryPressure);
      
      // Update cache stats
      const cacheInfo = MemoryManager.getCacheStats();
      setCacheStats(cacheInfo);
      
    } catch (error) {
      console.warn('Failed to update performance metrics:', error);
    }
  }, []);

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    
    // Initial update
    updateMetrics();
    
    // Set up periodic updates
    intervalRef.current = setInterval(updateMetrics, updateInterval);
    
    // Set up memory warning callback
    memoryWarningCallbackRef.current = (info: MemoryInfo) => {
      setMemoryInfo(info);
      setMemoryPressure(info.memoryPressure);
      
      // Trigger automatic cleanup on high memory pressure
      if (info.memoryPressure === 'high') {
        console.warn('High memory pressure detected, performing automatic cleanup');
        MemoryManager.performCleanup();
      }
    };
    
    MemoryManager.addMemoryWarningCallback(memoryWarningCallbackRef.current);
    
  }, [isMonitoring, updateMetrics, updateInterval]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;
    
    setIsMonitoring(false);
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Remove memory warning callback
    if (memoryWarningCallbackRef.current) {
      MemoryManager.removeMemoryWarningCallback(memoryWarningCallbackRef.current);
      memoryWarningCallbackRef.current = null;
    }
  }, [isMonitoring]);

  /**
   * Clear performance metrics
   */
  const clearPerformanceMetrics = useCallback(() => {
    PerformanceMonitor.clearMetrics();
    setPerformanceStats([]);
    setActiveOperations(0);
    setSlowOperations(0);
    setAverageResponseTime(0);
  }, []);

  /**
   * Clear memory cache
   */
  const clearMemoryCache = useCallback(async () => {
    try {
      await MemoryManager.clearImageCache(true);
      setCacheStats({
        imageCount: 0,
        totalSize: 0,
        oldestTimestamp: 0,
        newestTimestamp: 0,
      });
    } catch (error) {
      console.warn('Failed to clear memory cache:', error);
    }
  }, []);

  /**
   * Perform cleanup
   */
  const performCleanup = useCallback(async () => {
    try {
      await MemoryManager.performCleanup();
      // Update metrics after cleanup
      await updateMetrics();
    } catch (error) {
      console.warn('Failed to perform cleanup:', error);
    }
  }, [updateMetrics]);

  /**
   * Log performance summary
   */
  const logPerformanceSummary = useCallback(() => {
    PerformanceMonitor.logPerformanceSummary();
  }, []);

  /**
   * Handle app state changes
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && autoStart) {
        startMonitoring();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Perform cleanup when app goes to background
        performCleanup();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [autoStart, startMonitoring, performCleanup]);

  /**
   * Initialize monitoring
   */
  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }
    
    return () => {
      stopMonitoring();
    };
  }, [autoStart, startMonitoring, stopMonitoring]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    // Performance metrics
    performanceStats,
    activeOperations,
    slowOperations,
    averageResponseTime,
    
    // Memory information
    memoryInfo,
    memoryPressure,
    cacheStats,
    
    // Control methods
    clearPerformanceMetrics,
    clearMemoryCache,
    performCleanup,
    logPerformanceSummary,
    
    // Monitoring state
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  };
};