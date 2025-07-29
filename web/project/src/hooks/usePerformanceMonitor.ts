import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  isLowPerformance: boolean;
}

export const usePerformanceMonitor = (threshold = 30) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isLowPerformance: false
  });
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationId = useRef<number>();

  useEffect(() => {
    const measurePerformance = (currentTime: number) => {
      frameCount.current++;
      
      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        const frameTime = 1000 / fps;
        const isLowPerformance = fps < threshold;
        
        setMetrics({
          fps,
          frameTime,
          isLowPerformance
        });
        
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      animationId.current = requestAnimationFrame(measurePerformance);
    };
    
    animationId.current = requestAnimationFrame(measurePerformance);
    
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [threshold]);

  // Reduce animation complexity when performance is low
  const shouldReduceMotion = metrics.isLowPerformance;
  
  return {
    metrics,
    shouldReduceMotion,
    // Helper function to get optimized animation duration
    getOptimizedDuration: (baseDuration: number) => 
      shouldReduceMotion ? baseDuration * 0.5 : baseDuration,
    // Helper function to get optimized animation complexity
    getOptimizedComplexity: (baseComplexity: number) => 
      shouldReduceMotion ? Math.min(baseComplexity, 0.5) : baseComplexity
  };
}; 