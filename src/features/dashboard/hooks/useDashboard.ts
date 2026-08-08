"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchDashboardData, type DashboardBackendData } from "@/features/dashboard/services/dashboardService";

export function useDashboard(uid: string = "priya-demo") {
  const [data, setData] = useState<DashboardBackendData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboardData(uid);
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard statistics from server.");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
}
