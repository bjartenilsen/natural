/**
 * Performance monitoring utilities
 * Tracks operation performance, database query times, and API response times
 */

export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceStats {
  operation: string;
  count: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  lastExecuted: number;
}

export class PerformanceMonitor {
  private static metrics: Map<string, PerformanceMetric[]> = new Map();
  private static activeOperations: Map<string, PerformanceMetric> = new Map();
  private static readonly MAX_METRICS_PER_OPERATION = 100;
  private static readonly PERFORMANCE_LOG_THRESHOLD = 1000; // Log operations taking more than 1 second

  /**
   * Start tracking a performance metric
   */
  static startOperation(operation: string, metadata?: Record<string, any>): string {
    const operationId = `${operation}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    const metric: PerformanceMetric = {
      operation,
      startTime: performance.now(),
      metadata,
    };
    
    this.activeOperations.set(operationId, metric);
    return operationId;
  }

  /**
   * End tracking a performance metric
   */
  static endOperation(operationId: string): PerformanceMetric | null {
    const metric = this.activeOperations.get(operationId);
    
    if (!metric) {
      console.warn(`Performance metric not found for operation ID: ${operationId}`);
      return null;
    }
    
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    
    // Remove from active operations
    this.activeOperations.delete(operationId);
    
    // Add to metrics history
    this.addMetricToHistory(metric);
    
    // Log slow operations
    if (metric.duration > this.PERFORMANCE_LOG_THRESHOLD) {
      console.warn(`Slow operation detected: ${metric.operation} took ${metric.duration.toFixed(2)}ms`, metric.metadata);
    }
    
    return metric;
  }

  /**
   * Track a complete operation with automatic timing
   */
  static async trackOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const operationId = this.startOperation(operation, metadata);
    
    try {
      const result = await fn();
      this.endOperation(operationId);
      return result;
    } catch (error) {
      const metric = this.activeOperations.get(operationId);
      if (metric) {
        metric.endTime = performance.now();
        metric.duration = metric.endTime - metric.startTime;
        metric.metadata = { ...metric.metadata, error: error instanceof Error ? error.message : 'Unknown error' };
        this.activeOperations.delete(operationId);
        this.addMetricToHistory(metric);
      }
      throw error;
    }
  }

  /**
   * Track a synchronous operation
   */
  static trackSyncOperation<T>(
    operation: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const operationId = this.startOperation(operation, metadata);
    
    try {
      const result = fn();
      this.endOperation(operationId);
      return result;
    } catch (error) {
      const metric = this.activeOperations.get(operationId);
      if (metric) {
        metric.endTime = performance.now();
        metric.duration = metric.endTime - metric.startTime;
        metric.metadata = { ...metric.metadata, error: error instanceof Error ? error.message : 'Unknown error' };
        this.activeOperations.delete(operationId);
        this.addMetricToHistory(metric);
      }
      throw error;
    }
  }

  /**
   * Get performance statistics for an operation
   */
  static getOperationStats(operation: string): PerformanceStats | null {
    const metrics = this.metrics.get(operation);
    
    if (!metrics || metrics.length === 0) {
      return null;
    }
    
    const durations = metrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!);
    
    if (durations.length === 0) {
      return null;
    }
    
    const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
    const averageDuration = totalDuration / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const lastExecuted = Math.max(...metrics.map(m => m.startTime));
    
    return {
      operation,
      count: durations.length,
      totalDuration,
      averageDuration,
      minDuration,
      maxDuration,
      lastExecuted,
    };
  }

  /**
   * Get all performance statistics
   */
  static getAllStats(): PerformanceStats[] {
    const stats: PerformanceStats[] = [];
    
    for (const operation of this.metrics.keys()) {
      const operationStats = this.getOperationStats(operation);
      if (operationStats) {
        stats.push(operationStats);
      }
    }
    
    return stats.sort((a, b) => b.lastExecuted - a.lastExecuted);
  }

  /**
   * Get slow operations (above threshold)
   */
  static getSlowOperations(threshold: number = this.PERFORMANCE_LOG_THRESHOLD): PerformanceMetric[] {
    const slowOperations: PerformanceMetric[] = [];
    
    for (const metrics of this.metrics.values()) {
      for (const metric of metrics) {
        if (metric.duration && metric.duration > threshold) {
          slowOperations.push(metric);
        }
      }
    }
    
    return slowOperations.sort((a, b) => (b.duration || 0) - (a.duration || 0));
  }

  /**
   * Clear all performance metrics
   */
  static clearMetrics(): void {
    this.metrics.clear();
    this.activeOperations.clear();
  }

  /**
   * Clear metrics for a specific operation
   */
  static clearOperationMetrics(operation: string): void {
    this.metrics.delete(operation);
    
    // Remove any active operations for this operation type
    for (const [id, metric] of this.activeOperations.entries()) {
      if (metric.operation === operation) {
        this.activeOperations.delete(id);
      }
    }
  }

  /**
   * Get current active operations
   */
  static getActiveOperations(): PerformanceMetric[] {
    return Array.from(this.activeOperations.values());
  }

  /**
   * Get performance summary
   */
  static getPerformanceSummary(): {
    totalOperations: number;
    activeOperations: number;
    slowOperations: number;
    averageResponseTime: number;
    operationTypes: string[];
  } {
    const allStats = this.getAllStats();
    const slowOps = this.getSlowOperations();
    const activeOps = this.getActiveOperations();
    
    const totalOperations = allStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalDuration = allStats.reduce((sum, stat) => sum + stat.totalDuration, 0);
    const averageResponseTime = totalOperations > 0 ? totalDuration / totalOperations : 0;
    
    return {
      totalOperations,
      activeOperations: activeOps.length,
      slowOperations: slowOps.length,
      averageResponseTime,
      operationTypes: Array.from(this.metrics.keys()),
    };
  }

  /**
   * Log performance summary to console
   */
  static logPerformanceSummary(): void {
    const summary = this.getPerformanceSummary();
    
    console.log('=== Performance Summary ===');
    console.log(`Total Operations: ${summary.totalOperations}`);
    console.log(`Active Operations: ${summary.activeOperations}`);
    console.log(`Slow Operations: ${summary.slowOperations}`);
    console.log(`Average Response Time: ${summary.averageResponseTime.toFixed(2)}ms`);
    console.log(`Operation Types: ${summary.operationTypes.join(', ')}`);
    
    if (summary.slowOperations > 0) {
      console.log('\n=== Slow Operations ===');
      const slowOps = this.getSlowOperations().slice(0, 5); // Top 5 slowest
      slowOps.forEach(op => {
        console.log(`${op.operation}: ${op.duration?.toFixed(2)}ms`, op.metadata);
      });
    }
  }

  /**
   * Private helper methods
   */
  private static addMetricToHistory(metric: PerformanceMetric): void {
    if (!this.metrics.has(metric.operation)) {
      this.metrics.set(metric.operation, []);
    }
    
    const operationMetrics = this.metrics.get(metric.operation)!;
    operationMetrics.push(metric);
    
    // Keep only the most recent metrics to prevent memory leaks
    if (operationMetrics.length > this.MAX_METRICS_PER_OPERATION) {
      operationMetrics.splice(0, operationMetrics.length - this.MAX_METRICS_PER_OPERATION);
    }
  }

  /**
   * Decorator for automatic performance tracking
   */
  static track(operation?: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value;
      const operationName = operation || `${target.constructor.name}.${propertyName}`;
      
      descriptor.value = async function (...args: any[]) {
        return PerformanceMonitor.trackOperation(
          operationName,
          () => method.apply(this, args),
          { args: args.length }
        );
      };
    };
  }
}