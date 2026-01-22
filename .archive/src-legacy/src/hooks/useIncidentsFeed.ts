import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher'; // Adjust to your fetcher

export interface Incident {
  id: string;
  timestamp: string;
  status: 'CRITICAL' | 'DEGRADED' | 'RESOLVED';
  service: string | null;
  message: string;
  metadata: any;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
}

export interface UseIncidentsFeedOptions {
  page?: number;
  limit?: number;
  status?: string;
  service?: string;
  from?: string;
  to?: string;
  acknowledged?: boolean;
}

export function useIncidentsFeed(options: UseIncidentsFeedOptions = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    service,
    from,
    to,
    acknowledged,
  } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
    ...(service && { service }),
    ...(from && { from }),
    ...(to && { to }),
    ...(acknowledged !== undefined && { acknowledged: acknowledged.toString() }),
  });

  const { data, error, mutate, isLoading } = useSWR(
    \/api/incidents?\\,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    incidents: data?.incidents as Incident[],
    pagination: data?.pagination,
    error,
    mutate,
    isLoading,
  };
}
