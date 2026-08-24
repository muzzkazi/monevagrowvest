import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { prewarmAmfiSearch, searchAmfi, subscribeAmfiUpdates } from "@/lib/amfiSearch";

type Hit = { schemeCode: number | string; schemeName: string };

/**
 * Type-ahead AMFI scheme picker. Picking a scheme returns the exact AMFI
 * scheme name + code so fund house / sub-category can be auto-classified.
 */
const SchemePicker = ({
  value,
  onSelect,
  onTextChange,
  placeholder = "Start typing the scheme name…",
}: {
  value: string;
  onSelect: (hit: Hit) => void;
  onTextChange?: (text: string) => void;
  placeholder?: string;
}) => {
  const [query, setQuery] = useState(value);
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState(Boolean(value));
  const [tick, setTick] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => { prewarmAmfiSearch(); }, []);
  useEffect(() => subscribeAmfiUpdates(() => setTick((t) => t + 1)), []);
  useEffect(() => { setQuery(value); setPicked(Boolean(value)); }, [value]);

  const trimmed = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (trimmed.length < 3 || picked) { setHits([]); return; }
    const ctrl = new AbortController();
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await searchAmfi(trimmed, ctrl.signal);
      if (cancelled) return;
      setHits(res.slice(0, 40));
      setLoading(false);
      setOpen(true);
    }, 220);
    return () => { cancelled = true; clearTimeout(t); ctrl.abort(); setLoading(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed, picked, tick]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="relative" ref={boxRef}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          placeholder={placeholder}
          className="h-9 pl-8 pr-8"
          onChange={(e) => {
            setQuery(e.target.value);
            setPicked(false);
            onTextChange?.(e.target.value);
          }}
          onFocus={() => { if (hits.length > 0) setOpen(true); }}
          aria-label="Search mutual fund scheme"
          autoComplete="off"
        />
        {loading && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        {!loading && picked && trimmed.length > 0 && (
          <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-financial-success" />
        )}
      </div>

      {open && !picked && trimmed.length >= 3 && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
          {hits.length === 0 && !loading && (
            <p className="px-3 py-2.5 text-xs text-muted-foreground">
              No AMFI scheme matched — keep typing, or leave the name as typed.
            </p>
          )}
          {hits.map((h) => (
            <button
              key={String(h.schemeCode)}
              type="button"
              className={cn(
                "w-full text-left px-3 py-2 text-xs leading-snug hover:bg-financial-muted focus:bg-financial-muted focus:outline-none",
              )}
              onClick={() => {
                setPicked(true);
                setQuery(h.schemeName);
                setOpen(false);
                onSelect(h);
              }}
            >
              {h.schemeName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemePicker;
