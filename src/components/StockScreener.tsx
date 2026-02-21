import { useState, useMemo, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import { allStocks, sectors, industries, presetScreeners, indexDefinitions, StockInfo } from "@/data/stockDatabase";
import { exportToCSV, exportToExcel } from "@/lib/exportUtils";
import { StockDetailModal } from "@/components/stock-detail/StockDetailModal";
import { toast } from "sonner";
import { 
  Search, TrendingUp, TrendingDown, RefreshCw, ChevronUp, ChevronDown, ArrowUpDown,
  Loader2, Sparkles, X, Heart, Download, FileSpreadsheet, User, LogOut, LogIn,
  SlidersHorizontal, ChevronRight, BarChart3, Building2, LineChart, Activity
} from "lucide-react";

type SortField = "symbol" | "price" | "change" | "marketCap" | "peRatio" | "dividendYield" | "rsi" | "roe" | "macd" | "adx" | "beta" | "monthlyReturn";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 50;

const StockScreener = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  const [visibleSymbols, setVisibleSymbols] = useState<string[]>([]);
  const { prices, isLoading, error, lastUpdated, refreshPrices } = useStockPrices(visibleSymbols);

  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockInfo | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [marketCapRange, setMarketCapRange] = useState<[number, number]>([0, 2000000]);
  const [rsiRange, setRsiRange] = useState<[number, number]>([0, 100]);
  const [nearHighLow, setNearHighLow] = useState<string>("all");
  const [smaFilter, setSmaFilter] = useState<string>("all");
  const [priceVsSma50Range, setPriceVsSma50Range] = useState<[number, number]>([-50, 50]);
  const [priceVsSma200Range, setPriceVsSma200Range] = useState<[number, number]>([-50, 50]);
  const [macdFilter, setMacdFilter] = useState<string>("all");
  const [adxRange, setAdxRange] = useState<[number, number]>([0, 100]);
  const [stochasticRange, setStochasticRange] = useState<[number, number]>([0, 100]);
  const [mfiRange, setMfiRange] = useState<[number, number]>([0, 100]);
  const [atrPercentRange, setAtrPercentRange] = useState<[number, number]>([0, 5]);
  const [betaRange, setBetaRange] = useState<[number, number]>([0, 3]);
  const [bollingerFilter, setBollingerFilter] = useState<string>("all");
  const [weeklyReturnRange, setWeeklyReturnRange] = useState<[number, number]>([-20, 20]);
  const [monthlyReturnRange, setMonthlyReturnRange] = useState<[number, number]>([-30, 30]);
  const [quarterlyReturnRange, setQuarterlyReturnRange] = useState<[number, number]>([-50, 50]);
  const [yearlyReturnRange, setYearlyReturnRange] = useState<[number, number]>([-50, 100]);
  const [volumeChangeMin, setVolumeChangeMin] = useState(-100);
  const [highVolumeOnly, setHighVolumeOnly] = useState(false);
  const [peRange, setPeRange] = useState<[number, number]>([0, 100]);
  const [dividendYieldMin, setDividendYieldMin] = useState(0);
  const [roeMin, setRoeMin] = useState(0);
  const [debtToEquityMax, setDebtToEquityMax] = useState(15);
  const [sortField, setSortField] = useState<SortField>("marketCap");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredIndustries = useMemo(() => {
    if (selectedSector === "All") return industries;
    const sectorIndustries = allStocks
      .filter(s => s.sector === selectedSector)
      .map(s => s.industry);
    return ["All", ...Array.from(new Set(sectorIndustries)).sort()];
  }, [selectedSector]);

  // Active filter chips
  const activeFilters = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (selectedIndex !== "All") chips.push({ label: `Index: ${indexDefinitions[selectedIndex as keyof typeof indexDefinitions]}`, onRemove: () => setSelectedIndex("All") });
    if (selectedSector !== "All") chips.push({ label: `Sector: ${selectedSector}`, onRemove: () => { setSelectedSector("All"); setSelectedIndustry("All"); } });
    if (selectedIndustry !== "All") chips.push({ label: `Industry: ${selectedIndustry}`, onRemove: () => setSelectedIndustry("All") });
    if (priceRange[0] > 0 || priceRange[1] < 100000) chips.push({ label: `Price: ₹${priceRange[0].toLocaleString()}-₹${priceRange[1].toLocaleString()}`, onRemove: () => setPriceRange([0, 100000]) });
    if (marketCapRange[0] > 0 || marketCapRange[1] < 2000000) chips.push({ label: `M.Cap: ${formatMarketCap(marketCapRange[0])}-${formatMarketCap(marketCapRange[1])}`, onRemove: () => setMarketCapRange([0, 2000000]) });
    if (rsiRange[0] > 0 || rsiRange[1] < 100) chips.push({ label: `RSI: ${rsiRange[0]}-${rsiRange[1]}`, onRemove: () => setRsiRange([0, 100]) });
    if (smaFilter !== "all") chips.push({ label: `SMA: ${smaFilter}`, onRemove: () => setSmaFilter("all") });
    if (macdFilter !== "all") chips.push({ label: `MACD: ${macdFilter}`, onRemove: () => setMacdFilter("all") });
    if (nearHighLow !== "all") chips.push({ label: nearHighLow === "near52High" ? "Near 52W High" : "Near 52W Low", onRemove: () => setNearHighLow("all") });
    if (peRange[0] > 0 || peRange[1] < 100) chips.push({ label: `P/E: ${peRange[0]}-${peRange[1]}`, onRemove: () => setPeRange([0, 100]) });
    if (dividendYieldMin > 0) chips.push({ label: `Div ≥ ${dividendYieldMin.toFixed(1)}%`, onRemove: () => setDividendYieldMin(0) });
    if (roeMin > 0) chips.push({ label: `ROE ≥ ${roeMin}%`, onRemove: () => setRoeMin(0) });
    if (highVolumeOnly) chips.push({ label: "High Volume", onRemove: () => setHighVolumeOnly(false) });
    return chips;
  }, [selectedIndex, selectedSector, selectedIndustry, priceRange, marketCapRange, rsiRange, smaFilter, macdFilter, nearHighLow, peRange, dividendYieldMin, roeMin, highVolumeOnly]);

  const filteredStocks = useMemo(() => {
    let filtered = allStocks.filter(stock => {
      const price = prices[stock.symbol]?.price || stock.marketCap / 100;
      if (showWatchlistOnly && !isInWatchlist(stock.symbol)) return false;
      if (activePreset) {
        const preset = presetScreeners.find(p => p.id === activePreset);
        if (preset && !preset.filter(stock)) return false;
      }
      if (searchQuery && !stock.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedSector !== "All" && stock.sector !== selectedSector) return false;
      if (selectedIndustry !== "All" && stock.industry !== selectedIndustry) return false;
      if (selectedIndex !== "All" && !stock.indices.includes(selectedIndex)) return false;
      if (price < priceRange[0] || price > priceRange[1]) return false;
      if (stock.marketCap < marketCapRange[0] || stock.marketCap > marketCapRange[1]) return false;
      if (stock.rsi < rsiRange[0] || stock.rsi > rsiRange[1]) return false;
      if (nearHighLow === "near52High" && price < stock.high52Week * 0.95) return false;
      if (nearHighLow === "near52Low" && price > stock.low52Week * 1.05) return false;
      if (smaFilter !== "all") {
        if (smaFilter === "above50" && stock.priceVsSma50 < 0) return false;
        if (smaFilter === "below50" && stock.priceVsSma50 > 0) return false;
        if (smaFilter === "above200" && stock.priceVsSma200 < 0) return false;
        if (smaFilter === "below200" && stock.priceVsSma200 > 0) return false;
        if (smaFilter === "goldenCross" && stock.sma50 <= stock.sma200) return false;
        if (smaFilter === "deathCross" && stock.sma50 >= stock.sma200) return false;
      }
      if (stock.priceVsSma50 < priceVsSma50Range[0] || stock.priceVsSma50 > priceVsSma50Range[1]) return false;
      if (stock.priceVsSma200 < priceVsSma200Range[0] || stock.priceVsSma200 > priceVsSma200Range[1]) return false;
      if (macdFilter !== "all") {
        if (macdFilter === "bullish" && stock.macdHistogram < 0) return false;
        if (macdFilter === "bearish" && stock.macdHistogram > 0) return false;
        if (macdFilter === "crossover" && Math.abs(stock.macdHistogram) > 2) return false;
      }
      if (stock.adx < adxRange[0] || stock.adx > adxRange[1]) return false;
      if (stock.stochastic < stochasticRange[0] || stock.stochastic > stochasticRange[1]) return false;
      if (stock.mfi < mfiRange[0] || stock.mfi > mfiRange[1]) return false;
      if (stock.atrPercent < atrPercentRange[0] || stock.atrPercent > atrPercentRange[1]) return false;
      if (stock.beta < betaRange[0] || stock.beta > betaRange[1]) return false;
      if (bollingerFilter !== "all") {
        const pricePos = (price - stock.bollingerLower) / (stock.bollingerUpper - stock.bollingerLower);
        if (bollingerFilter === "nearUpper" && pricePos < 0.8) return false;
        if (bollingerFilter === "nearLower" && pricePos > 0.2) return false;
        if (bollingerFilter === "squeeze" && stock.bollingerWidth > 3) return false;
      }
      if (stock.weeklyReturn < weeklyReturnRange[0] || stock.weeklyReturn > weeklyReturnRange[1]) return false;
      if (stock.monthlyReturn < monthlyReturnRange[0] || stock.monthlyReturn > monthlyReturnRange[1]) return false;
      if (stock.quarterlyReturn < quarterlyReturnRange[0] || stock.quarterlyReturn > quarterlyReturnRange[1]) return false;
      if (stock.yearlyReturn < yearlyReturnRange[0] || stock.yearlyReturn > yearlyReturnRange[1]) return false;
      if (stock.volumeChange < volumeChangeMin) return false;
      if (highVolumeOnly && stock.volumeChange < 50) return false;
      if (stock.peRatio < peRange[0] || stock.peRatio > peRange[1]) return false;
      if (stock.dividendYield < dividendYieldMin) return false;
      if (stock.roe < roeMin) return false;
      if (stock.debtToEquity > debtToEquityMax) return false;
      return true;
    });

    filtered.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortField) {
        case "symbol":
          return sortDirection === "asc" ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol);
        case "price":
          aVal = prices[a.symbol]?.price || a.marketCap / 100;
          bVal = prices[b.symbol]?.price || b.marketCap / 100;
          break;
        case "change":
          aVal = prices[a.symbol]?.changePercent || 0;
          bVal = prices[b.symbol]?.changePercent || 0;
          break;
        case "marketCap": aVal = a.marketCap; bVal = b.marketCap; break;
        case "peRatio": aVal = a.peRatio; bVal = b.peRatio; break;
        case "dividendYield": aVal = a.dividendYield; bVal = b.dividendYield; break;
        case "rsi": aVal = a.rsi; bVal = b.rsi; break;
        case "roe": aVal = a.roe; bVal = b.roe; break;
        case "macd": aVal = a.macdHistogram; bVal = b.macdHistogram; break;
        case "adx": aVal = a.adx; bVal = b.adx; break;
        case "beta": aVal = a.beta; bVal = b.beta; break;
        case "monthlyReturn": aVal = a.monthlyReturn; bVal = b.monthlyReturn; break;
        default: aVal = 0; bVal = 0;
      }
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
    return filtered;
  }, [prices, searchQuery, selectedSector, selectedIndustry, selectedIndex, priceRange, marketCapRange, rsiRange, nearHighLow, smaFilter, priceVsSma50Range, priceVsSma200Range, macdFilter, adxRange, stochasticRange, mfiRange, atrPercentRange, betaRange, bollingerFilter, weeklyReturnRange, monthlyReturnRange, quarterlyReturnRange, yearlyReturnRange, volumeChangeMin, highVolumeOnly, peRange, dividendYieldMin, roeMin, debtToEquityMax, sortField, sortDirection, activePreset, showWatchlistOnly, isInWatchlist]);

  const paginatedStocks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStocks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStocks, currentPage]);

  const totalPages = Math.ceil(filteredStocks.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setVisibleSymbols(paginatedStocks.map(s => s.symbol));
  }, [paginatedStocks]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
    return sortDirection === "asc" ? <ChevronUp className="w-3 h-3 ml-1 text-accent" /> : <ChevronDown className="w-3 h-3 ml-1 text-accent" />;
  };

  const resetFilters = () => {
    setSearchQuery(""); setSelectedSector("All"); setSelectedIndustry("All"); setSelectedIndex("All");
    setPriceRange([0, 100000]); setMarketCapRange([0, 2000000]); setRsiRange([0, 100]);
    setNearHighLow("all"); setSmaFilter("all"); setPriceVsSma50Range([-50, 50]); setPriceVsSma200Range([-50, 50]);
    setMacdFilter("all"); setAdxRange([0, 100]); setStochasticRange([0, 100]); setMfiRange([0, 100]);
    setAtrPercentRange([0, 5]); setBetaRange([0, 3]); setBollingerFilter("all");
    setWeeklyReturnRange([-20, 20]); setMonthlyReturnRange([-30, 30]); setQuarterlyReturnRange([-50, 50]);
    setYearlyReturnRange([-50, 100]); setVolumeChangeMin(-100); setHighVolumeOnly(false);
    setPeRange([0, 100]); setDividendYieldMin(0); setRoeMin(0); setDebtToEquityMax(15);
    setActivePreset(null); setCurrentPage(1);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L Cr`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K Cr`;
    return `₹${value.toLocaleString()} Cr`;
  };

  const handleExportCSV = () => {
    const exportData = filteredStocks.map(stock => ({
      ...stock, livePrice: prices[stock.symbol]?.price, change: prices[stock.symbol]?.change, changePercent: prices[stock.symbol]?.changePercent,
    }));
    exportToCSV(exportData);
    toast.success(`Exported ${exportData.length} stocks to CSV`);
  };

  const handleExportExcel = () => {
    const exportData = filteredStocks.map(stock => ({
      ...stock, livePrice: prices[stock.symbol]?.price, change: prices[stock.symbol]?.change, changePercent: prices[stock.symbol]?.changePercent,
    }));
    exportToExcel(exportData);
    toast.success(`Exported ${exportData.length} stocks to Excel`);
  };

  const handleWatchlistToggle = async (stock: StockInfo) => {
    if (!user) { navigate('/auth'); return; }
    if (isInWatchlist(stock.symbol)) {
      await removeFromWatchlist(stock.symbol);
    } else {
      await addToWatchlist(stock.symbol, stock.name);
    }
  };

  const activePresetInfo = presetScreeners.find(p => p.id === activePreset);

  

  return (
    <div className="py-6 sm:py-10 bg-background min-h-[80vh]">
      <div className="container mx-auto px-4 max-w-[1400px]">
        
        {/* Header Bar */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Stock Screener</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{allStocks.length}+ stocks · NSE & BSE</p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                    <Download className="w-3.5 h-3.5" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {user && (
                <Button 
                  variant={showWatchlistOnly ? "default" : "outline"} 
                  size="sm" className="gap-1.5 text-xs h-8"
                  onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
                >
                  <Heart className={`w-3.5 h-3.5 ${showWatchlistOnly ? 'fill-current' : ''}`} />
                  {watchlist.length}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={refreshPrices} disabled={isLoading} className="h-8 w-8 p-0">
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <User className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button size="sm" onClick={() => navigate('/auth')} className="gap-1.5 text-xs h-8">
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or symbol..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-9 h-9 text-sm bg-card"
            />
          </div>
        </div>

        {/* Popular Screens */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Popular Screens</span>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-1">
              <TooltipProvider delayDuration={200}>
              {presetScreeners.map(preset => (
                <Tooltip key={preset.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { setActivePreset(activePreset === preset.id ? null : preset.id); setCurrentPage(1); }}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        activePreset === preset.id
                          ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                          : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
                      }`}
                    >
                      {preset.name}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px] text-xs">
                    <p className="font-semibold">{preset.name}</p>
                    <p className="text-muted-foreground">{preset.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              </TooltipProvider>
            </div>
          </ScrollArea>
          {activePresetInfo && (
            <div className="mt-2 flex items-center gap-2">
              <Badge className="gap-1.5 bg-accent/10 text-accent hover:bg-accent/20 border-accent/20 text-xs">
                <LineChart className="w-3 h-3" />
                {activePresetInfo.name}: {activePresetInfo.description}
                <button onClick={() => setActivePreset(null)} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>

        {/* Filter Chips Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-border bg-card hover:bg-muted/80 transition-colors text-foreground">
                <LineChart className="w-3.5 h-3.5" /> Index <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="start">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Index</Label>
                <Select value={selectedIndex} onValueChange={(v) => { setSelectedIndex(v); setCurrentPage(1); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Indices</SelectItem>
                    {Object.entries(indexDefinitions).map(([key, name]) => (
                      <SelectItem key={key} value={key}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-border bg-card hover:bg-muted/80 transition-colors text-foreground">
                <Building2 className="w-3.5 h-3.5" /> Sector <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="start">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sector</Label>
                  <Select value={selectedSector} onValueChange={(v) => { setSelectedSector(v); setSelectedIndustry("All"); setCurrentPage(1); }}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Industry</Label>
                  <Select value={selectedIndustry} onValueChange={(v) => { setSelectedIndustry(v); setCurrentPage(1); }}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {filteredIndustries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-border bg-card hover:bg-muted/80 transition-colors text-foreground">
                <BarChart3 className="w-3.5 h-3.5" /> Market Cap <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="start">
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Market Cap Range</Label>
                <Slider value={marketCapRange} onValueChange={(v) => setMarketCapRange(v as [number, number])} min={0} max={2000000} step={10000} className="py-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatMarketCap(marketCapRange[0])}</span>
                  <span>{formatMarketCap(marketCapRange[1])}</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {[{ label: "Large Cap", range: [100000, 2000000] as [number, number] }, { label: "Mid Cap", range: [20000, 100000] as [number, number] }, { label: "Small Cap", range: [0, 20000] as [number, number] }].map(cap => (
                    <button key={cap.label} onClick={() => setMarketCapRange(cap.range)}
                      className="px-2.5 py-1 rounded-md text-xs border border-border hover:bg-accent/10 hover:border-accent/30 transition-colors">
                      {cap.label}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-border bg-card hover:bg-muted/80 transition-colors text-foreground">
                <span className="text-xs font-bold">₹</span> Price <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="start">
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price Range</Label>
                <Slider value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} min={0} max={100000} step={500} className="py-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹{priceRange[0].toLocaleString()}</span>
                  <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-border bg-card hover:bg-muted/80 transition-colors text-foreground">
                <Activity className="w-3.5 h-3.5" /> Technical <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="start">
              <div className="space-y-4 max-h-80 overflow-y-auto">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">RSI (14)</Label>
                  <Slider value={rsiRange} onValueChange={(v) => setRsiRange(v as [number, number])} min={0} max={100} step={5} className="py-2" />
                  <div className="flex justify-between text-xs text-muted-foreground"><span>{rsiRange[0]}</span><span>{rsiRange[1]}</span></div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setRsiRange([0, 30])} className="px-2 py-0.5 rounded text-xs border border-border hover:bg-accent/10">Oversold</button>
                    <button onClick={() => setRsiRange([70, 100])} className="px-2 py-0.5 rounded text-xs border border-border hover:bg-accent/10">Overbought</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Moving Average</Label>
                  <Select value={smaFilter} onValueChange={setSmaFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="above50">Above 50 DMA</SelectItem>
                      <SelectItem value="below50">Below 50 DMA</SelectItem>
                      <SelectItem value="above200">Above 200 DMA</SelectItem>
                      <SelectItem value="below200">Below 200 DMA</SelectItem>
                      <SelectItem value="goldenCross">Golden Cross</SelectItem>
                      <SelectItem value="deathCross">Death Cross</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">52-Week</Label>
                  <Select value={nearHighLow} onValueChange={setNearHighLow}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="near52High">Near 52W High</SelectItem>
                      <SelectItem value="near52Low">Near 52W Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">MACD</Label>
                  <Select value={macdFilter} onValueChange={setMacdFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="bullish">Bullish</SelectItem>
                      <SelectItem value="bearish">Bearish</SelectItem>
                      <SelectItem value="crossover">Crossover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Beta</Label>
                  <Slider value={betaRange} onValueChange={(v) => setBetaRange(v as [number, number])} min={0} max={3} step={0.1} className="py-2" />
                  <div className="flex justify-between text-xs text-muted-foreground"><span>{betaRange[0].toFixed(1)}</span><span>{betaRange[1].toFixed(1)}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="hv" checked={highVolumeOnly} onCheckedChange={(c) => setHighVolumeOnly(c as boolean)} />
                  <Label htmlFor="hv" className="text-xs cursor-pointer">High volume only (+50%)</Label>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-border bg-card hover:bg-muted/80 transition-colors text-foreground">
                <BarChart3 className="w-3.5 h-3.5" /> Fundamental <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">P/E Ratio</Label>
                  <Slider value={peRange} onValueChange={(v) => setPeRange(v as [number, number])} min={0} max={100} step={1} className="py-2" />
                  <div className="flex justify-between text-xs text-muted-foreground"><span>{peRange[0]}</span><span>{peRange[1]}</span></div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Min Dividend Yield</Label>
                  <Slider value={[dividendYieldMin]} onValueChange={(v) => setDividendYieldMin(v[0])} min={0} max={5} step={0.1} className="py-2" />
                  <div className="text-xs text-muted-foreground">{dividendYieldMin.toFixed(1)}%+</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Min ROE</Label>
                  <Slider value={[roeMin]} onValueChange={(v) => setRoeMin(v[0])} min={0} max={50} step={1} className="py-2" />
                  <div className="text-xs text-muted-foreground">{roeMin}%+</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max Debt/Equity</Label>
                  <Slider value={[debtToEquityMax]} onValueChange={(v) => setDebtToEquityMax(v[0])} min={0} max={15} step={0.5} className="py-2" />
                  <div className="text-xs text-muted-foreground">≤ {debtToEquityMax.toFixed(1)}</div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {activeFilters.length > 0 && (
            <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-1">
              Clear all
            </button>
          )}
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {activeFilters.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-accent/10 text-accent border border-accent/20">
                {f.label}
                <button onClick={f.onRemove} className="hover:text-destructive"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm mb-4">{error}</div>
        )}

        {/* Results header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">{filteredStocks.length} stocks</span>
            {isLoading && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" /> Updating prices…
              </span>
            )}
          </div>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">Updated {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="py-3 px-3 w-10"></th>
                  <th className="text-left py-3 px-3">
                    <button className="flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => handleSort("symbol")}>
                      Company <SortIcon field="symbol" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-3">
                    <button className="flex items-center justify-end ml-auto text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => handleSort("price")}>
                      Price <SortIcon field="price" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-3">
                    <button className="flex items-center justify-end ml-auto text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => handleSort("change")}>
                      Change <SortIcon field="change" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-3 hidden sm:table-cell">
                    <button className="flex items-center justify-end ml-auto text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => handleSort("marketCap")}>
                      Market Cap <SortIcon field="marketCap" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-3 hidden md:table-cell">
                    <button className="flex items-center justify-end ml-auto text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => handleSort("peRatio")}>
                      P/E <SortIcon field="peRatio" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-3 hidden lg:table-cell">
                    <button className="flex items-center justify-end ml-auto text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => handleSort("dividendYield")}>
                      Div Yield <SortIcon field="dividendYield" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-3 hidden lg:table-cell">
                    <button className="flex items-center justify-end ml-auto text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => handleSort("rsi")}>
                      RSI <SortIcon field="rsi" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-3 hidden xl:table-cell">
                    <button className="flex items-center justify-end ml-auto text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => handleSort("roe")}>
                      ROE <SortIcon field="roe" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedStocks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 opacity-30" />
                        <p className="font-medium">No stocks found</p>
                        <p className="text-xs">{showWatchlistOnly && watchlist.length === 0 ? "Your watchlist is empty." : "Try adjusting your filters."}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedStocks.map(stock => {
                    const priceData = prices[stock.symbol];
                    const price = priceData?.price || 0;
                    const change = priceData?.change || 0;
                    const changePercent = priceData?.changePercent || 0;
                    const isPositive = change >= 0;
                    const hasLivePrice = !!priceData?.price;
                    const inWatchlist = isInWatchlist(stock.symbol);

                    return (
                      <tr 
                        key={stock.symbol}
                        className="hover:bg-muted/40 transition-colors cursor-pointer group"
                        onClick={() => { setSelectedStock(stock); setIsDetailModalOpen(true); }}
                      >
                        <td className="py-3 px-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleWatchlistToggle(stock); }}
                            className={`p-1 rounded-full transition-all ${inWatchlist ? 'text-rose-500' : 'text-muted-foreground/40 group-hover:text-muted-foreground'}`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-current' : ''}`} />
                          </button>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                              {stock.symbol.slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground text-sm truncate">{stock.symbol}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[140px] sm:max-w-[200px]">{stock.name}</div>
                            </div>
                            <div className="hidden sm:flex items-center gap-1 ml-1 shrink-0">
                              {stock.indices.includes("NIFTY50") && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/15 text-accent">N50</span>
                              )}
                              {stock.indices.includes("SENSEX") && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400">BSE</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-3 font-semibold tabular-nums">
                          {hasLivePrice ? `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="text-right py-3 px-3">
                          {hasLivePrice ? (
                            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${
                              isPositive 
                                ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50' 
                                : 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/50'
                            }`}>
                              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                            </span>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="text-right py-3 px-3 text-xs text-muted-foreground hidden sm:table-cell tabular-nums">
                          {formatMarketCap(stock.marketCap)}
                        </td>
                        <td className="text-right py-3 px-3 text-xs tabular-nums hidden md:table-cell">
                          {stock.peRatio.toFixed(1)}
                        </td>
                        <td className="text-right py-3 px-3 text-xs tabular-nums hidden lg:table-cell">
                          {stock.dividendYield.toFixed(1)}%
                        </td>
                        <td className="text-right py-3 px-3 hidden lg:table-cell">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium tabular-nums ${
                            stock.rsi < 30 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' 
                            : stock.rsi > 70 ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400' 
                            : 'bg-muted text-muted-foreground'
                          }`}>
                            {stock.rsi}
                          </span>
                        </td>
                        <td className="text-right py-3 px-3 text-xs tabular-nums hidden xl:table-cell">
                          {stock.roe.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
              <p className="text-xs text-muted-foreground">
                {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredStocks.length)} of {filteredStocks.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      className="w-7 h-7 p-0 text-xs"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <StockDetailModal
        stock={selectedStock}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        livePrice={selectedStock ? prices[selectedStock.symbol]?.price : undefined}
        priceChange={selectedStock ? prices[selectedStock.symbol]?.change : undefined}
        changePercent={selectedStock ? prices[selectedStock.symbol]?.changePercent : undefined}
      />
    </div>
  );
};

export default StockScreener;
