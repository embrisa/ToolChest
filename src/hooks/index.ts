// Tool hooks
export * from './tools';

// Admin hooks  
export * from './admin';

// Core hooks
export * from './core';

// Loading hooks
export { useLoadingManager, useGlobalLoading, createAnnouncementElement } from './useLoadingManager';

// Error handling hooks
export { useClientErrorHandler } from './useClientErrorHandler';

// Performance optimization hooks
export { usePerformanceOptimization } from './usePerformanceOptimization';
export type { PerformanceMetrics, PreloadOptions, CacheStrategy } from './usePerformanceOptimization'; 