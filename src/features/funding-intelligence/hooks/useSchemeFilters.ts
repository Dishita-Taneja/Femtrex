"use client";

import { useState, useEffect, useCallback } from "react";
import { matchSchemes } from "@/features/funding-intelligence/services/fundingService";
import type { FundingFilters } from "@/features/funding-intelligence/types/funding";

export function useSchemeFilters(uid: string = "priya-demo") {
  const [filters, setFilters] = useState<FundingFilters>({ query: "", womenOnly: false });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await matchSchemes(filters, uid);
      setResults(data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch scheme matches from server.");
    } finally {
      setLoading(false);
    }
  }, [filters, uid]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  function patch(update: Partial<FundingFilters>) {
    setFilters((current) => ({ ...current, ...update }));
  }

  return { filters, results, loading, error, patch, refetch: fetchMatches };
}
