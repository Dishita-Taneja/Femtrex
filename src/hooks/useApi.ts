import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

/**
 * Generic hook for making API calls with automatic auth handling.
 *
 * @param endpoint API endpoint (relative or absolute)
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param body Optional request body for methods like POST/PUT
 * @returns { data, error, loading, execute }
 */
export function useApi<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = async (overrideEndpoint?: string, overrideBody?: any) => {
    setLoading(true);
    setError(null);
    try {
      const url = overrideEndpoint ?? endpoint;
      const payload = method === 'GET' ? undefined : JSON.stringify(overrideBody ?? body);
      const response = await apiFetch<T>(url, {
        method,
        body: payload,
      });
      setData(response);
      return response;
    } catch (e: any) {
      setError(e?.message ?? 'API request failed');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Auto‑execute for GET requests on mount
  useEffect(() => {
    if (method === 'GET') {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  return { data, error, loading, execute };
}
