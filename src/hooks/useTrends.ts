"use client";

import { useState, useEffect, useCallback } from "react";
import type { TrendDay } from "@/types";

interface UseTrendsReturn {
  data: TrendDay[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTrends(userId = "anon", days = 7): UseTrendsReturn {
  const [data, setData] = useState<TrendDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trends?userId=${userId}&days=${days}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      setData(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trends");
    } finally {
      setLoading(false);
    }
  }, [userId, days]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return { data, loading, error, refetch: fetchTrends };
}
