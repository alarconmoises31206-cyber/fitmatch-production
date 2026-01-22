import { useState, useEffect, useCallback } from 'react';
import { SystemHealthReport } from '@/types/monitoring';

interface UseHealthFeedOptions {
  interval?: number; // in milliseconds
  enabled?: boolean;
}

export function useHealthFeed(options: UseHealthFeedOptions = {}) {
  const { interval = 5000, enabled = true } = options;
  
  const [data, setData] = useState<SystemHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealthData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/monitor/health');
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }
      
      const healthData: SystemHealthReport = await response.json();
      
      setData(healthData);
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching health data';
      setError(errorMessage);
      setIsLoading(false);
      console.error('Failed to fetch health data:', err);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchHealthData();

    // Set up interval for polling
    const intervalId = setInterval(fetchHealthData, interval);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchHealthData, interval, enabled]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchHealthData,
  };
}
