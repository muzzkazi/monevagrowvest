import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NavMetrics, NavSeries, computeNavMetrics } from "@/lib/pi/navMetrics";

interface NavResponse {
  series: NavSeries[];
  unavailable: string[];
  cacheMaxAgeHours: number;
  servedAt: string;
}

/**
 * Fetches NAV history for the given scheme codes through the mf-nav edge
 * function (which caches in nav_cache) and derives deterministic metrics.
 * Freshness is always exposed so the UI can label how current the data is.
 */
export const useNavData = (schemeCodes: string[]) => {
  const codes = useMemo(
    () => [...new Set(schemeCodes.map((c) => String(c ?? "").trim()).filter((c) => /^\d{1,8}$/.test(c)))].sort(),
    [schemeCodes],
  );
  const key = codes.join(",");

  const [series, setSeries] = useState<NavSeries[]>([]);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [servedAt, setServedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNav = useCallback(
    async (forceRefresh = false) => {
      if (!codes.length) {
        setSeries([]);
        setUnavailable([]);
        setServedAt(null);
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error: fnError } = await supabase.functions.invoke<NavResponse>("mf-nav", {
        body: { schemeCodes: codes, forceRefresh },
      });
      if (fnError) {
        setError(fnError.message);
        setLoading(false);
        return;
      }
      setSeries(data?.series ?? []);
      setUnavailable(data?.unavailable ?? []);
      setServedAt(data?.servedAt ?? null);
      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  useEffect(() => {
    fetchNav(false);
  }, [fetchNav]);

  const metrics = useMemo(() => {
    const map = new Map<string, NavMetrics>();
    series.forEach((s) => map.set(s.schemeCode, computeNavMetrics(s)));
    return map;
  }, [series]);

  const oldestFetchedAt = useMemo(() => {
    const stamps = series.map((s) => s.fetchedAt).filter(Boolean).sort();
    return stamps[0] ?? null;
  }, [series]);

  return {
    series,
    metrics,
    unavailable,
    servedAt,
    oldestFetchedAt,
    loading,
    error,
    refresh: () => fetchNav(true),
    requestedCodes: codes,
  };
};
