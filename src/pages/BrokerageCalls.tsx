import { useMemo, useState } from "react";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBrokerRecos, BrokerReco } from "@/hooks/useBrokerRecos";
import { BrokerCallsTableSkeleton, BrokerCallsCardSkeleton } from "@/components/shared/DataSkeletons";
import { useStockPrices } from "@/hooks/useStockPrices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  ExternalLink,
  LayoutGrid,
  RefreshCw,
  Table as TableIcon,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type SortKey = "date" | "broker" | "stock" | "target" | "upside" | "recommendation";
type SortDir = "asc" | "desc";

const CALL_TYPES = ["Buy", "Accumulate", "Hold", "Neutral", "Reduce", "Sell"] as const;

function relativeDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

function recoColor(rec: string) {
  if (rec === "Buy" || rec === "Accumulate") return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30";
  if (rec === "Sell" || rec === "Reduce") return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30";
  return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
}

const BrokerageCalls = () => {
  const { recos, isLoading, error, lastUpdated, source, refresh } = useBrokerRecos(150);
  const symbols = useMemo(() => recos.map((r) => r.ticker).filter(Boolean), [recos]);
  const { prices } = useStockPrices(symbols);

  const [view, setView] = useState<"table" | "cards">("table");
  const [search, setSearch] = useState("");
  const [brokerF, setBrokerF] = useState<string>("all");
  const [callF, setCallF] = useState<string>("all");
  const [sectorF, setSectorF] = useState<string>("all");
  const [dateF, setDateF] = useState<string>("all"); // all | 1d | 7d | 30d
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const brokers = useMemo(
    () => Array.from(new Set(recos.map((r) => r.broker).filter(Boolean))).sort(),
    [recos],
  );
  const sectors = useMemo(
    () => Array.from(new Set(recos.map((r) => r.sector).filter(Boolean))).sort() as string[],
    [recos],
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff =
      dateF === "1d" ? now - 86400000 :
      dateF === "7d" ? now - 7 * 86400000 :
      dateF === "30d" ? now - 30 * 86400000 :
      0;
    const q = search.trim().toLowerCase();
    return recos.filter((r) => {
      if (brokerF !== "all" && r.broker !== brokerF) return false;
      if (callF !== "all" && r.recommendation !== callF) return false;
      if (sectorF !== "all" && r.sector !== sectorF) return false;
      if (cutoff && new Date(r.date).getTime() < cutoff) return false;
      if (q && !(`${r.stock} ${r.ticker} ${r.broker}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [recos, brokerF, callF, sectorF, dateF, search]);

  const upsideFor = (r: BrokerReco) => {
    const live = r.ticker ? prices[r.ticker]?.price : undefined;
    if (!live || live <= 0) return null;
    return ((r.targetPrice - live) / live) * 100;
  };

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case "date": return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
        case "broker": return a.broker.localeCompare(b.broker) * dir;
        case "stock": return a.stock.localeCompare(b.stock) * dir;
        case "target": return (a.targetPrice - b.targetPrice) * dir;
        case "recommendation": return a.recommendation.localeCompare(b.recommendation) * dir;
        case "upside": {
          const ua = upsideFor(a) ?? -Infinity;
          const ub = upsideFor(b) ?? -Infinity;
          return (ua - ub) * dir;
        }
      }
    });
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortKey, sortDir, prices]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir(k === "stock" || k === "broker" ? "asc" : "desc"); }
  };

  const SortHeader = ({ k, label, className = "" }: { k: SortKey; label: string; className?: string }) => (
    <TableHead className={className}>
      <button
        onClick={() => toggleSort(k)}
        className="inline-flex items-center gap-1 font-medium hover:text-financial-accent transition-colors"
      >
        {label}
        {sortKey === k ? (
          sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-50" />
        )}
      </button>
    </TableHead>
  );

  const resetFilters = () => {
    setSearch(""); setBrokerF("all"); setCallF("all"); setSectorF("all"); setDateF("all");
  };

  useEffect(() => {
    document.title = "Brokerage Calls — All Buy/Sell Stock Picks from Top Brokers";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); return m;
    })();
    meta.setAttribute(
      "content",
      "Consolidated view of the latest brokerage stock recommendations from India's top firms. Filter by broker, call type, sector and date; sort by target price or upside."
    );
  }, []);

  return (
    <div className="min-h-screen bg-background">


      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              Brokerage <span className="text-financial-accent">Calls</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              All recent buy/sell/hold calls from Moneycontrol, Economic Times and other top desks — consolidated, filterable and sortable.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {relativeDate(lastUpdated.toISOString())}
                {source === "cache" && " • cached"}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <Input
              placeholder="Search stock, ticker or broker…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="lg:col-span-2"
            />
            <Select value={brokerF} onValueChange={setBrokerF}>
              <SelectTrigger><SelectValue placeholder="Broker" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brokers</SelectItem>
                {brokers.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={callF} onValueChange={setCallF}>
              <SelectTrigger><SelectValue placeholder="Call type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All calls</SelectItem>
                {CALL_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sectorF} onValueChange={setSectorF}>
              <SelectTrigger><SelectValue placeholder="Sector" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sectors</SelectItem>
                {sectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={dateF} onValueChange={setDateF}>
              <SelectTrigger><SelectValue placeholder="Date" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any date</SelectItem>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{sorted.length}</span> of {recos.length} calls
            {sorted.length !== recos.length && (
              <Button variant="link" size="sm" onClick={resetFilters} className="h-auto p-0 ml-2">
                Clear filters
              </Button>
            )}
          </p>
          <div className="inline-flex rounded-md border bg-muted/30 p-0.5">
            <button
              onClick={() => setView("table")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded ${view === "table" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              <TableIcon className="w-3.5 h-3.5" /> Table
            </button>
            <button
              onClick={() => setView("cards")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded ${view === "cards" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
          </div>
        </div>

        {error && recos.length === 0 && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 mb-4 text-sm">
            {error}
          </div>
        )}

        {isLoading && recos.length === 0 ? (
          view === "table" ? <BrokerCallsTableSkeleton rows={10} /> : <BrokerCallsCardSkeleton count={8} />
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No calls match the current filters.
          </div>
        ) : view === "table" ? (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHeader k="stock" label="Stock" />
                    <SortHeader k="recommendation" label="Call" />
                    <SortHeader k="target" label="Target" className="text-right" />
                    <TableHead className="text-right">CMP</TableHead>
                    <SortHeader k="upside" label="Upside" className="text-right" />
                    <SortHeader k="broker" label="Broker" />
                    <TableHead>Sector</TableHead>
                    <SortHeader k="date" label="Date" />
                    <TableHead className="text-right">Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((r, idx) => {
                    const live = r.ticker ? prices[r.ticker]?.price : undefined;
                    const upside = upsideFor(r);
                    return (
                      <TableRow key={`${r.stock}-${r.broker}-${idx}`}>
                        <TableCell>
                          <div className="font-medium">{r.stock}</div>
                          {r.ticker && <div className="text-xs text-muted-foreground font-mono">{r.ticker}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${recoColor(r.recommendation)} text-xs`}>
                            {r.recommendation}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-financial-accent">
                          {inr(r.targetPrice)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {live ? inr(live) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          {upside === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span className={`inline-flex items-center gap-0.5 font-medium ${upside >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {upside >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              {upside >= 0 ? "+" : ""}{upside.toFixed(1)}%
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{r.broker}</TableCell>
                        <TableCell>
                          {r.sector ? (
                            <Badge variant="secondary" className="text-xs">{r.sector}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {relativeDate(r.date)}
                        </TableCell>
                        <TableCell className="text-right">
                          <a
                            href={r.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-financial-accent hover:opacity-80"
                            aria-label="Open source"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((r, idx) => {
              const live = r.ticker ? prices[r.ticker]?.price : undefined;
              const upside = upsideFor(r);
              return (
                <Card key={`${r.stock}-${r.broker}-${idx}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold truncate">{r.stock}</div>
                        {r.ticker && <div className="text-xs text-muted-foreground font-mono">{r.ticker}</div>}
                      </div>
                      <Badge variant="outline" className={`${recoColor(r.recommendation)} text-xs shrink-0`}>
                        {r.recommendation}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-financial-accent/10 rounded p-2">
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" />Target</div>
                        <div className="font-mono font-semibold text-financial-accent">{inr(r.targetPrice)}</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <div className="text-xs text-muted-foreground">Upside</div>
                        {upside === null ? (
                          <div className="text-muted-foreground">—</div>
                        ) : (
                          <div className={`font-semibold ${upside >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {upside >= 0 ? "+" : ""}{upside.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span className="inline-flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{r.broker}</span>
                      </span>
                      <span>{relativeDate(r.date)}</span>
                    </div>
                    {r.sector && <Badge variant="secondary" className="text-xs">{r.sector}</Badge>}
                    <a
                      href={r.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-financial-accent hover:opacity-80"
                    >
                      View source <ExternalLink className="w-3 h-3" />
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BrokerageCalls;
