import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BrokerReco {
  stock: string;
  ticker: string;
  recommendation: "Buy" | "Hold" | "Sell" | "Accumulate" | "Reduce" | "Neutral";
  targetPrice: number;
  broker: string;
  date: string;
  rationale: string;
  sourceUrl: string;
  sector?: string;
}


interface UseBrokerRecosResult {
  recos: BrokerReco[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  source: "rss" | "cache" | null;
  fetchedAt: Date | null;
  refresh: () => Promise<void>;
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const useBrokerRecos = (limit = 9): UseBrokerRecosResult => {
  const [recos, setRecos] = useState<BrokerReco[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [source, setSource] = useState<"rss" | "cache" | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  const fetchRecos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("broker-recos", {
        body: { limit },
      });
      if (fnError) throw fnError;
      const list: BrokerReco[] = Array.isArray(data?.recos) ? data.recos : [];
      setRecos(list);
      setLastUpdated(new Date());
      setSource((data?.source as "rss" | "cache") ?? null);
      setFetchedAt(data?.fetchedAt ? new Date(data.fetchedAt) : null);
    } catch (e: any) {
      console.error("broker-recos fetch failed:", e);
      setError(e?.message || "Failed to load recommendations");
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecos();
    const id = setInterval(fetchRecos, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchRecos]);

  return { recos, isLoading, error, lastUpdated, source, fetchedAt, refresh: fetchRecos };
};
