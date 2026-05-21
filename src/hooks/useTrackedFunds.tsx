import { useEffect, useState, useCallback } from "react";

export type TrackedFund = {
  code: string;
  name: string;
  monthlySIP: number;
  addedAt: string;
};

const KEY = "moneva.trackedFunds.v1";

const read = (): TrackedFund[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const write = (list: TrackedFund[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* quota exhausted — ignore */
  }
};

export const useTrackedFunds = () => {
  const [funds, setFunds] = useState<TrackedFund[]>([]);

  useEffect(() => {
    setFunds(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setFunds(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addFund = useCallback((f: Omit<TrackedFund, "addedAt">) => {
    setFunds((prev) => {
      if (prev.some((p) => p.code === f.code)) return prev;
      const next = [...prev, { ...f, addedAt: new Date().toISOString() }];
      write(next);
      return next;
    });
  }, []);

  const removeFund = useCallback((code: string) => {
    setFunds((prev) => {
      const next = prev.filter((p) => p.code !== code);
      write(next);
      return next;
    });
  }, []);

  const updateSIP = useCallback((code: string, sip: number) => {
    setFunds((prev) => {
      const next = prev.map((p) => (p.code === code ? { ...p, monthlySIP: sip } : p));
      write(next);
      return next;
    });
  }, []);

  return { funds, addFund, removeFund, updateSIP };
};
