import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, Filter, Star, TrendingUp, ArrowUpDown, ChevronUp, ChevronDown, 
  X, BarChart3, Plus, Minus, SlidersHorizontal, RotateCcw, RefreshCw, Wifi, Loader2, Sparkles
} from "lucide-react";
import { 
  mutualFunds as staticFunds, fundCategories, fundSubCategories, fundHouses, 
  mfPresetScreeners, MutualFundInfo 
} from "@/data/mutualFundDatabase";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MutualFundDetailModal from "@/components/mutual-fund-detail/MutualFundDetailModal";

type SortField = "schemeName" | "nav" | "returns1Y" | "returns3Y" | "returns5Y" | "aum" | "expenseRatio" | "rating";
type SortDirection = "asc" | "desc";

interface MutualFundScreenerProps {
  onCompare?: (funds: MutualFundInfo[]) => void;
}

// ---- AMFI search helpers (for funds beyond the curated list) ----
const inferSubCategory = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("small cap") || n.includes("smallcap")) return "Small Cap";
  if (n.includes("mid cap") || n.includes("midcap") || n.includes("emerging")) return "Mid Cap";
  if (n.includes("large & mid") || n.includes("large and mid")) return "Large & Mid Cap";
  if (n.includes("flexi cap") || n.includes("flexicap")) return "Flexi Cap";
  if (n.includes("multi cap") || n.includes("multicap")) return "Multi Cap";
  if (n.includes("elss") || n.includes("tax saver") || n.includes("tax plan") || n.includes("long term equity")) return "ELSS";
  if (n.includes("value")) return "Value";
  if (n.includes("liquid")) return "Liquid";
  if (n.includes("ultra short")) return "Ultra Short Duration";
  if (n.includes("short duration") || n.includes("short term")) return "Short Duration";
  if (n.includes("gilt")) return "Gilt";
  if (n.includes("corporate bond")) return "Corporate Bond";
  if (n.includes("arbitrage")) return "Arbitrage";
  if (n.includes("balanced advantage")) return "Balanced Advantage";
  if (n.includes("hybrid")) return "Aggressive Hybrid";
  if (n.includes("index") || n.includes("nifty") || n.includes("sensex")) return "Index Fund";
  if (n.includes("pharma") || n.includes("tech") || n.includes("digital") || n.includes("banking") || n.includes("infra") || n.includes("fmcg") || n.includes("energy") || n.includes("sectoral")) return "Sectoral";
  if (n.includes("large cap") || n.includes("bluechip") || n.includes("blue chip") || n.includes("top 100")) return "Large Cap";
  return "Flexi Cap";
};

const inferFundHouse = (name: string): string => name.split(/\s+/)[0] || "Unknown";

const fromAmfiScheme = (s: { schemeCode: number | string; schemeName: string }): MutualFundInfo => {
  const sub = inferSubCategory(s.schemeName);
  const debt = ["Liquid", "Short Duration", "Long Duration", "Gilt", "Corporate Bond", "Banking & PSU", "Ultra Short Duration", "Medium Duration"].includes(sub);
  return {
    schemeCode: String(s.schemeCode),
    schemeName: s.schemeName,
    category: debt ? "Debt" : sub === "Aggressive Hybrid" || sub === "Arbitrage" || sub === "Balanced Advantage" ? "Hybrid" : "Equity",
    subCategory: sub,
    fundHouse: inferFundHouse(s.schemeName),
    plan: s.schemeName.toLowerCase().includes("direct") ? "Direct" : "Regular",
    nav: 0,
    aum: 0,
    expenseRatio: 0,
    rating: 0,
    riskLevel: debt ? "Low" : "High",
    returns1Y: 0, returns3Y: 0, returns5Y: 0, returns10Y: 0,
    sipMinimum: 500, lumpSumMinimum: 5000,
    exitLoad: "—", benchmark: "—", fundManager: "—", inceptionDate: "—",
  };
};

const MutualFundScreener = ({ onCompare }: MutualFundScreenerProps) => {
  const { toast } = useToast();
  const [mutualFunds, setMutualFunds] = useState<MutualFundInfo[]>(staticFunds);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [liveDataLoaded, setLiveDataLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [selectedFundHouse, setSelectedFundHouse] = useState("All");
  const [selectedPlan, setSelectedPlan] = useState("All");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  // Range filters
  const [aumRange, setAumRange] = useState<[number, number]>([0, 80000]);
  const [expenseRange, setExpenseRange] = useState<[number, number]>([0, 1.5]);
  const [returns3YRange, setReturns3YRange] = useState<[number, number]>([-5, 40]);
  const [minRating, setMinRating] = useState(0);
  const [riskLevels, setRiskLevels] = useState<string[]>([]);

  // Sorting
  const [sortField, setSortField] = useState<SortField>("aum");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Comparison
  const [compareList, setCompareList] = useState<MutualFundInfo[]>([]);

  // Fund detail modal
  const [selectedFund, setSelectedFund] = useState<MutualFundInfo | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // AMFI-wide search
  const [amfiResults, setAmfiResults] = useState<MutualFundInfo[]>([]);
  const [amfiSearching, setAmfiSearching] = useState(false);
  const [addingCode, setAddingCode] = useState<string | null>(null);

  // Fetch live NAV data
  const fetchLiveNAVs = useCallback(async () => {
    setIsLoadingLive(true);
    try {
      const codes = staticFunds.map(f => f.schemeCode);
      // Batch in chunks of 30
      const chunks: string[][] = [];
      for (let i = 0; i < codes.length; i += 30) {
        chunks.push(codes.slice(i, i + 30));
      }

      const allResults: Array<{ code: string; meta?: { fund_house?: string; scheme_name?: string }; data?: Array<{ date: string; nav: string }> }> = [];
      
      for (const chunk of chunks) {
        const { data, error } = await supabase.functions.invoke('mutual-funds', {
          body: { codes: chunk },
          headers: { 'Content-Type': 'application/json' },
        });
        // For batch, we need to pass action as query param but invoke doesn't support that easily
        // Use direct fetch instead
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mutual-funds?action=batch`,
          {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ codes: chunk }),
          }
        );
        const result = await response.json();
        if (result.results) {
          allResults.push(...result.results);
        }
      }

      // Update funds with live NAV data
      setMutualFunds(prev => prev.map(fund => {
        const live = allResults.find(r => r.code === fund.schemeCode);
        if (live?.data && live.data.length > 0) {
          const latestNav = parseFloat(live.data[0].nav);
          if (!isNaN(latestNav)) {
            return { ...fund, nav: latestNav };
          }
        }
        return fund;
      }));

      setLiveDataLoaded(true);
      setLastUpdated(new Date());
      toast({ title: "Live NAV Updated", description: `Updated NAVs for ${allResults.length} funds from MFAPI.in` });
    } catch (error) {
      console.error('Error fetching live NAVs:', error);
      toast({ title: "Failed to fetch live data", description: "Using cached data instead", variant: "destructive" });
    } finally {
      setIsLoadingLive(false);
    }
  }, [toast]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchLiveNAVs();
  }, [fetchLiveNAVs]);

  // Debounced AMFI-wide search (only when query is meaningful)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 3) {
      setAmfiResults([]);
      setAmfiSearching(false);
      return;
    }
    setAmfiSearching(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/mutual-funds?action=search&q=${encodeURIComponent(q)}`,
          { signal: ctrl.signal },
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const existing = new Set(mutualFunds.map(f => f.schemeCode));
          const mapped = data
            .filter((s: any) => s && s.schemeCode && s.schemeName)
            .map((s: any) => fromAmfiScheme(s))
            .filter((f) => !existing.has(f.schemeCode))
            .slice(0, 25);
          setAmfiResults(mapped);
        } else {
          setAmfiResults([]);
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") setAmfiResults([]);
      } finally {
        setAmfiSearching(false);
      }
    }, 350);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [searchQuery, mutualFunds]);

  // Add an AMFI fund to the list (with live NAV) and open its detail modal
  const addAmfiFund = useCallback(async (fund: MutualFundInfo) => {
    setAddingCode(fund.schemeCode);
    try {
      const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/mutual-funds?action=latest&code=${fund.schemeCode}`,
      );
      const data = await res.json();
      let nav = 0;
      if (data?.data?.[0]?.nav) nav = parseFloat(data.data[0].nav) || 0;
      const enriched: MutualFundInfo = { ...fund, nav };
      setMutualFunds(prev => prev.some(f => f.schemeCode === enriched.schemeCode) ? prev : [enriched, ...prev]);
      setAmfiResults(prev => prev.filter(f => f.schemeCode !== fund.schemeCode));
      // Reset numeric range filters so the new (zero-data) fund is visible in the table
      setAumRange([0, 80000]);
      setExpenseRange([0, 1.5]);
      setReturns3YRange([-5, 40]);
      setMinRating(0);
      setRiskLevels([]);
      toast({ title: "Added from AMFI", description: fund.schemeName.split(" - ")[0] });
    } catch {
      toast({ title: "Could not add fund", description: "Try again.", variant: "destructive" });
    } finally {
      setAddingCode(null);
    }
  }, [toast]);

  const subCategories = useMemo(() => {
    if (selectedCategory === "All") {
      return Object.values(fundSubCategories).flat();
    }
    return fundSubCategories[selectedCategory] || [];
  }, [selectedCategory]);

  const filteredFunds = useMemo(() => {
    let filtered = mutualFunds.filter(fund => {
      if (activePreset) {
        const preset = mfPresetScreeners.find(p => p.id === activePreset);
        if (preset && !preset.filter(fund)) return false;
      }

      if (searchQuery && !fund.schemeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !fund.fundHouse.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategory !== "All" && fund.category !== selectedCategory) return false;
      if (selectedSubCategory !== "All" && fund.subCategory !== selectedSubCategory) return false;
      if (selectedFundHouse !== "All" && fund.fundHouse !== selectedFundHouse) return false;
      if (selectedPlan !== "All" && fund.plan !== selectedPlan) return false;
      if (fund.aum < aumRange[0] || fund.aum > aumRange[1]) return false;
      if (fund.expenseRatio < expenseRange[0] || fund.expenseRatio > expenseRange[1]) return false;
      if (fund.returns3Y < returns3YRange[0] || fund.returns3Y > returns3YRange[1]) return false;
      if (fund.rating < minRating) return false;
      if (riskLevels.length > 0 && !riskLevels.includes(fund.riskLevel)) return false;

      return true;
    });

    filtered.sort((a, b) => {
      let aVal: number | string, bVal: number | string;
      switch (sortField) {
        case "schemeName": return sortDirection === "asc" ? a.schemeName.localeCompare(b.schemeName) : b.schemeName.localeCompare(a.schemeName);
        case "nav": aVal = a.nav; bVal = b.nav; break;
        case "returns1Y": aVal = a.returns1Y; bVal = b.returns1Y; break;
        case "returns3Y": aVal = a.returns3Y; bVal = b.returns3Y; break;
        case "returns5Y": aVal = a.returns5Y; bVal = b.returns5Y; break;
        case "aum": aVal = a.aum; bVal = b.aum; break;
        case "expenseRatio": aVal = a.expenseRatio; bVal = b.expenseRatio; break;
        case "rating": aVal = a.rating; bVal = b.rating; break;
        default: aVal = 0; bVal = 0;
      }
      return sortDirection === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedSubCategory, selectedFundHouse, selectedPlan, aumRange, expenseRange, returns3YRange, minRating, riskLevels, sortField, sortDirection, activePreset]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return sortDirection === "asc" ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />;
  };

  const toggleCompare = (fund: MutualFundInfo) => {
    setCompareList(prev => {
      const exists = prev.find(f => f.schemeCode === fund.schemeCode);
      if (exists) return prev.filter(f => f.schemeCode !== fund.schemeCode);
      if (prev.length >= 4) return prev;
      return [...prev, fund];
    });
  };

  const isInCompare = (code: string) => compareList.some(f => f.schemeCode === code);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedSubCategory("All");
    setSelectedFundHouse("All");
    setSelectedPlan("All");
    setAumRange([0, 80000]);
    setExpenseRange([0, 1.5]);
    setReturns3YRange([-5, 40]);
    setMinRating(0);
    setRiskLevels([]);
    setActivePreset(null);
  };

  const formatAUM = (val: number) => {
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K Cr`;
    return `₹${val.toLocaleString()} Cr`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
    ));
  };

  const riskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Moderate": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "High": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "Very High": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      default: return "";
    }
  };

  const activePresetInfo = mfPresetScreeners.find(p => p.id === activePreset);
  const activeFiltersCount = [
    selectedCategory !== "All",
    selectedSubCategory !== "All",
    selectedFundHouse !== "All",
    selectedPlan !== "All",
    aumRange[0] > 0 || aumRange[1] < 80000,
    expenseRange[0] > 0 || expenseRange[1] < 1.5,
    returns3YRange[0] > -5 || returns3YRange[1] < 40,
    minRating > 0,
    riskLevels.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Popular Screens - Tickertape style */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Popular Screens</h3>
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {mfPresetScreeners.map(preset => (
              <button
                key={preset.id}
                onClick={() => setActivePreset(activePreset === preset.id ? null : preset.id)}
                className={`flex-shrink-0 rounded-xl border p-4 min-w-[180px] text-left transition-all hover:shadow-md ${
                  activePreset === preset.id 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{preset.icon}</span>
                  <span className="font-semibold text-sm text-foreground">{preset.name}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{preset.description}</div>
                <div className="text-xs text-muted-foreground mt-2">{preset.userCount} users</div>
              </button>
            ))}
          </div>
        </ScrollArea>
        {activePresetInfo && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="gap-1 text-xs">
              {activePresetInfo.icon} {activePresetInfo.name}
              <button onClick={() => setActivePreset(null)} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </div>
        )}
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search mutual funds or fund house..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
              <RotateCcw className="w-3 h-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedSubCategory("All"); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fundCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Sub Category</label>
                <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {subCategories.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Fund House</label>
                <Select value={selectedFundHouse} onValueChange={setSelectedFundHouse}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fundHouses.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Plan</label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Direct">Direct</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Min Rating</label>
                <Select value={String(minRating)} onValueChange={(v) => setMinRating(Number(v))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Risk Level</label>
                <Select value={riskLevels.length === 1 ? riskLevels[0] : "All"} onValueChange={(v) => setRiskLevels(v === "All" ? [] : [v])}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Very High">Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Range Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">AUM (₹ Cr)</label>
                <Slider value={aumRange} onValueChange={(v) => setAumRange(v as [number, number])} min={0} max={80000} step={1000} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatAUM(aumRange[0])}</span>
                  <span>{formatAUM(aumRange[1])}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Expense Ratio (%)</label>
                <Slider value={expenseRange} onValueChange={(v) => setExpenseRange(v as [number, number])} min={0} max={1.5} step={0.05} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{expenseRange[0].toFixed(2)}%</span>
                  <span>{expenseRange[1].toFixed(2)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">CAGR 3Y (%)</label>
                <Slider value={returns3YRange} onValueChange={(v) => setReturns3YRange(v as [number, number])} min={-5} max={40} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{returns3YRange[0]}%</span>
                  <span>{returns3YRange[1]}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compare hint banner — visible when no funds selected */}
      {compareList.length === 0 && (
        <div className="flex items-start sm:items-center gap-3 p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5">
          <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 text-sm">
            <span className="font-semibold text-foreground">Compare funds side by side.</span>{" "}
            <span className="text-muted-foreground">
              Click the <Plus className="inline w-3.5 h-3.5 mx-0.5 text-primary" /> button next to any fund (up to 4) to compare returns, risk, and portfolio overlap.
            </span>
          </div>
        </div>
      )}

      {/* Sticky compare bar */}
      {compareList.length > 0 && (
        <div className="sticky top-20 z-20 flex items-center gap-3 p-3 bg-primary/10 backdrop-blur-sm rounded-lg border-2 border-primary/40 shadow-lg animate-in slide-in-from-top-2">
          <BarChart3 className="w-5 h-5 text-primary shrink-0" />
          <span className="text-sm font-semibold whitespace-nowrap">Compare ({compareList.length}/4):</span>
          <div className="flex gap-2 flex-1 flex-wrap">
            {compareList.map(fund => (
              <Badge key={fund.schemeCode} variant="secondary" className="gap-1">
                {fund.schemeName.split(" - ")[0].slice(0, 25)}...
                <button onClick={() => toggleCompare(fund)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {compareList.length < 2 && (
              <span className="text-xs text-muted-foreground italic self-center">
                Add at least one more to compare →
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => onCompare?.(compareList)}
            disabled={compareList.length < 2}
            className="shrink-0 gap-1.5"
          >
            <BarChart3 className="w-4 h-4" />
            Compare Now
          </Button>
        </div>
      )}

      {/* Results count & live data indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredFunds.length}</span> mutual funds
        </p>
        <div className="flex items-center gap-3">
          {liveDataLoaded && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <Wifi className="w-3 h-3" />
              <span>Live NAV</span>
              {lastUpdated && <span className="text-muted-foreground">• {lastUpdated.toLocaleTimeString()}</span>}
            </div>
          )}
          {isLoadingLive && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Fetching live data...
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={fetchLiveNAVs} disabled={isLoadingLive} className="gap-1 h-7 text-xs">
            <RefreshCw className={`w-3 h-3 ${isLoadingLive ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Results Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16 text-center text-xs font-medium">Compare</TableHead>
              <TableHead>
                <button className="flex items-center hover:text-foreground transition-colors text-xs" onClick={() => handleSort("schemeName")}>
                  Fund Name <SortIcon field="schemeName" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end ml-auto hover:text-foreground transition-colors text-xs" onClick={() => handleSort("nav")}>
                  NAV <SortIcon field="nav" />
                </button>
              </TableHead>
              <TableHead className="text-right hidden sm:table-cell">
                <button className="flex items-center justify-end ml-auto hover:text-foreground transition-colors text-xs" onClick={() => handleSort("returns1Y")}>
                  1Y <SortIcon field="returns1Y" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end ml-auto hover:text-foreground transition-colors text-xs" onClick={() => handleSort("returns3Y")}>
                  3Y <SortIcon field="returns3Y" />
                </button>
              </TableHead>
              <TableHead className="text-right hidden md:table-cell">
                <button className="flex items-center justify-end ml-auto hover:text-foreground transition-colors text-xs" onClick={() => handleSort("returns5Y")}>
                  5Y <SortIcon field="returns5Y" />
                </button>
              </TableHead>
              <TableHead className="text-right hidden lg:table-cell">
                <button className="flex items-center justify-end ml-auto hover:text-foreground transition-colors text-xs" onClick={() => handleSort("aum")}>
                  AUM <SortIcon field="aum" />
                </button>
              </TableHead>
              <TableHead className="text-right hidden lg:table-cell">
                <button className="flex items-center justify-end ml-auto hover:text-foreground transition-colors text-xs" onClick={() => handleSort("expenseRatio")}>
                  Exp% <SortIcon field="expenseRatio" />
                </button>
              </TableHead>
              <TableHead className="text-center hidden xl:table-cell">
                <button className="flex items-center justify-center hover:text-foreground transition-colors text-xs" onClick={() => handleSort("rating")}>
                  Rating <SortIcon field="rating" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFunds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  No funds match your criteria. Try adjusting filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredFunds.map(fund => (
                <TableRow key={fund.schemeCode} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedFund(fund); setDetailModalOpen(true); }}>
                  <TableCell className="w-16 pr-0 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleCompare(fund); }}
                      className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md border text-xs font-medium transition-all ${
                        isInCompare(fund.schemeCode)
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary hover:bg-primary/5'
                      }`}
                      title={isInCompare(fund.schemeCode) ? "Remove from compare" : "Add to compare"}
                    >
                      {isInCompare(fund.schemeCode) ? (
                        <><Minus className="w-3 h-3" /> Added</>
                      ) : (
                        <><Plus className="w-3 h-3" /> Add</>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm text-foreground leading-tight">{fund.schemeName.split(" - ")[0]}</div>
                      <div className="flex gap-1.5 mt-1 flex-wrap items-center">
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">{fund.subCategory}</Badge>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${riskColor(fund.riskLevel)}`}>{fund.riskLevel}</span>
                        <span className="text-[10px] text-muted-foreground">{fund.fundHouse}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">₹{fund.nav.toFixed(2)}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    <span className={`text-sm font-medium ${fund.returns1Y >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {fund.returns1Y >= 0 ? '+' : ''}{fund.returns1Y.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`text-sm font-medium ${fund.returns3Y >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {fund.returns3Y >= 0 ? '+' : ''}{fund.returns3Y.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    <span className={`text-sm font-medium ${fund.returns5Y >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {fund.returns5Y > 0 ? `+${fund.returns5Y.toFixed(1)}%` : '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right hidden lg:table-cell text-sm">{formatAUM(fund.aum)}</TableCell>
                  <TableCell className="text-right hidden lg:table-cell text-sm">{fund.expenseRatio.toFixed(2)}%</TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="flex items-center justify-center gap-0.5">{renderStars(fund.rating)}</div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <MutualFundDetailModal
        fund={selectedFund}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onSelectFund={(sf) => setSelectedFund(sf)}
      />
    </div>
  );
};

export default MutualFundScreener;
