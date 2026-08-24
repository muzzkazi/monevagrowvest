import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { prewarmAmfiSearch, searchAmfi, subscribeAmfiUpdates } from "@/lib/amfiSearch";
import { rankSchemeHits, resolveSchemeName, type SchemeHit as Hit } from "@/lib/pi/schemeResolve";

/**
 * Type-ahead AMFI scheme picker. Picking a scheme — or simply typing a full
 * name and moving on — resolves to the exact AMFI scheme name + code so the
 * fund house / sub-category can be auto-classified.
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
  const [resolving, setResolving] = useState(false);
  const [picked, setPicked] = useState(Boolean(value));
  const [tick, setTick] = useState(0);
  const [active, setActive] = useState(0);
  const [noMatch, setNoMatch] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  /** Text this picker itself pushed upward — used to ignore echoed prop updates. */
  const selfText = useRef(value);

  useEffect(() => { prewarmAmfiSearch(); }, []);
  useEffect(() => subscribeAmfiUpdates(() => setTick((t) => t + 1)), []);
  useEffect(() => {
    // Ignore the parent echoing back what the user is currently typing —
    // otherwise the search closes itself on every keystroke.
    if (value === selfText.current) return;
    selfText.current = value;
    setQuery(value);
    setPicked(Boolean(value));
  }, [value]);

  const trimmed = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (trimmed.length < 3 || picked) { setHits([]); return; }
    const ctrl = new AbortController();
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await searchAmfi(trimmed, ctrl.signal);
      if (cancelled) return;
      setHits(rankSchemeHits(trimmed, res as Hit[]).slice(0, 40));
      setActive(0);
      setLoading(false);
      setOpen(true);
    }, 220);
    return () => { cancelled = true; clearTimeout(t); ctrl.abort(); setLoading(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed, picked, tick]);

  const commit = (hit: Hit) => {
    setPicked(true);
    setNoMatch(false);
    selfText.current = hit.schemeName;
    setQuery(hit.schemeName);
    setOpen(false);
    onSelect(hit);
  };

  /** Resolve free-typed text to the best AMFI scheme (blur / Enter). */
  const resolveTyped = async () => {
    if (picked || trimmed.length < 3) return;
    const top = hits[0];
    if (top) { commit(top); return; }
    setResolving(true);
    const best = await resolveSchemeName(trimmed);
    setResolving(false);
    if (best) commit(best);
    else setNoMatch(true);
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        void resolveTyped();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, trimmed, hits]);

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
            setNoMatch(false);
            selfText.current = e.target.value;
            onTextChange?.(e.target.value);
          }}
          onFocus={() => { if (hits.length > 0) setOpen(true); }}
          onBlur={() => { void resolveTyped(); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && hits.length) {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, hits.length - 1));
            } else if (e.key === "ArrowUp" && hits.length) {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (open && hits[active]) commit(hits[active]);
              else void resolveTyped();
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          aria-label="Search mutual fund scheme"
          autoComplete="off"
        />
        {(loading || resolving) && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        {!loading && !resolving && picked && trimmed.length > 0 && (
          <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-financial-primary" />
        )}
      </div>

      {noMatch && !picked && (
        <p className="mt-1 text-[11px] text-financial-gold">
          No AMFI scheme matched this name — it will be saved exactly as typed, so classification may need a manual check.
        </p>
      )}

      {open && !picked && trimmed.length >= 3 && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
          {hits.length === 0 && !loading && (
            <p className="px-3 py-2.5 text-xs text-muted-foreground">
              No AMFI scheme matched — keep typing, or leave the name as typed.
            </p>
          )}
          {hits.map((h, i) => (
            <button
              key={String(h.schemeCode)}
              type="button"
              className={cn(
                "w-full text-left px-3 py-2 text-xs leading-snug hover:bg-financial-muted focus:bg-financial-muted focus:outline-none",
                i === active && "bg-financial-muted",
              )}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(h)}
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
