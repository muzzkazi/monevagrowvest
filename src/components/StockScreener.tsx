import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import { allStocks, sectors, industries, presetScreeners, indexDefinitions, StockInfo } from "@/data/stockDatabase";
import { exportToCSV, exportToExcel } from "@/lib/exportUtils";
import { StockDetailModal } from "@/components/stock-detail/StockDetailModal";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  BarChart3, 
  Building2,
  Percent,
  IndianRupee,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Loader2,
  Sparkles,
  LineChart,
  X,
  Activity,
  Waves,
  Zap,
  Target,
  TrendingDown as TrendDown,
  Heart,
  Download,
  FileSpreadsheet,
  User,
  LogOut,
  LogIn
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

  // Preset screener selection
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  
  // Stock detail modal
  const [selectedStock, setSelectedStock] = useState<StockInfo | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Basic filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [marketCapRange, setMarketCapRange] = useState<[number, number]>([0, 2000000]);

  // Technical filters - Basic
  const [rsiRange, setRsiRange] = useState<[number, number]>([0, 100]);
  const [nearHighLow, setNearHighLow] = useState<string>("all");
  
  // Technical filters - Moving Averages
  const [smaFilter, setSmaFilter] = useState<string>("all"); // all, above50, below50, above200, below200, goldenCross, deathCross
  const [priceVsSma50Range, setPriceVsSma50Range] = useState<[number, number]>([-50, 50]);
  const [priceVsSma200Range, setPriceVsSma200Range] = useState<[number, number]>([-50, 50]);
  
  // Technical filters - Momentum
  const [macdFilter, setMacdFilter] = useState<string>("all"); // all, bullish, bearish, crossover
  const [adxRange, setAdxRange] = useState<[number, number]>([0, 100]);
  const [stochasticRange, setStochasticRange] = useState<[number, number]>([0, 100]);
  const [mfiRange, setMfiRange] = useState<[number, number]>([0, 100]);
  
  // Technical filters - Volatility
  const [atrPercentRange, setAtrPercentRange] = useState<[number, number]>([0, 5]);
  const [betaRange, setBetaRange] = useState<[number, number]>([0, 3]);
  const [bollingerFilter, setBollingerFilter] = useState<string>("all"); // all, nearUpper, nearLower, squeeze
  
  // Technical filters - Returns
  const [weeklyReturnRange, setWeeklyReturnRange] = useState<[number, number]>([-20, 20]);
  const [monthlyReturnRange, setMonthlyReturnRange] = useState<[number, number]>([-30, 30]);
  const [quarterlyReturnRange, setQuarterlyReturnRange] = useState<[number, number]>([-50, 50]);
  const [yearlyReturnRange, setYearlyReturnRange] = useState<[number, number]>([-50, 100]);
  
  // Technical filters - Volume
  const [volumeChangeMin, setVolumeChangeMin] = useState(-100);
  const [highVolumeOnly, setHighVolumeOnly] = useState(false);

  // Fundamental filters
  const [peRange, setPeRange] = useState<[number, number]>([0, 100]);
  const [dividendYieldMin, setDividendYieldMin] = useState(0);
  const [roeMin, setRoeMin] = useState(0);
  const [debtToEquityMax, setDebtToEquityMax] = useState(15);

  // Sorting
  const [sortField, setSortField] = useState<SortField>("marketCap");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Filter industries based on selected sector
  const filteredIndustries = useMemo(() => {
    if (selectedSector === "All") return industries;
    const sectorIndustries = allStocks
      .filter(s => s.sector === selectedSector)
      .map(s => s.industry);
    return ["All", ...Array.from(new Set(sectorIndustries)).sort()];
  }, [selectedSector]);

  const filteredStocks = useMemo(() => {
    let filtered = allStocks.filter(stock => {
      const price = prices[stock.symbol]?.price || stock.marketCap / 100;

      // Filter by watchlist if enabled
      if (showWatchlistOnly && !isInWatchlist(stock.symbol)) return false;

      // Apply preset screener if active
      if (activePreset) {
        const preset = presetScreeners.find(p => p.id === activePreset);
        if (preset && !preset.filter(stock)) return false;
      }

      // Basic filters
      if (searchQuery && !stock.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedSector !== "All" && stock.sector !== selectedSector) return false;
      if (selectedIndustry !== "All" && stock.industry !== selectedIndustry) return false;
      if (selectedIndex !== "All" && !stock.indices.includes(selectedIndex)) return false;
      if (price < priceRange[0] || price > priceRange[1]) return false;
      if (stock.marketCap < marketCapRange[0] || stock.marketCap > marketCapRange[1]) return false;

      // Technical filters - RSI
      if (stock.rsi < rsiRange[0] || stock.rsi > rsiRange[1]) return false;
      if (nearHighLow === "near52High" && price < stock.high52Week * 0.95) return false;
      if (nearHighLow === "near52Low" && price > stock.low52Week * 1.05) return false;
      
      // Technical filters - Moving Averages
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
      
      // Technical filters - Momentum
      if (macdFilter !== "all") {
        if (macdFilter === "bullish" && stock.macdHistogram < 0) return false;
        if (macdFilter === "bearish" && stock.macdHistogram > 0) return false;
        if (macdFilter === "crossover" && Math.abs(stock.macdHistogram) > 2) return false;
      }
      if (stock.adx < adxRange[0] || stock.adx > adxRange[1]) return false;
      if (stock.stochastic < stochasticRange[0] || stock.stochastic > stochasticRange[1]) return false;
      if (stock.mfi < mfiRange[0] || stock.mfi > mfiRange[1]) return false;
      
      // Technical filters - Volatility
      if (stock.atrPercent < atrPercentRange[0] || stock.atrPercent > atrPercentRange[1]) return false;
      if (stock.beta < betaRange[0] || stock.beta > betaRange[1]) return false;
      if (bollingerFilter !== "all") {
        const pricePos = (price - stock.bollingerLower) / (stock.bollingerUpper - stock.bollingerLower);
        if (bollingerFilter === "nearUpper" && pricePos < 0.8) return false;
        if (bollingerFilter === "nearLower" && pricePos > 0.2) return false;
        if (bollingerFilter === "squeeze" && stock.bollingerWidth > 3) return false;
      }
      
      // Technical filters - Returns
      if (stock.weeklyReturn < weeklyReturnRange[0] || stock.weeklyReturn > weeklyReturnRange[1]) return false;
      if (stock.monthlyReturn < monthlyReturnRange[0] || stock.monthlyReturn > monthlyReturnRange[1]) return false;
      if (stock.quarterlyReturn < quarterlyReturnRange[0] || stock.quarterlyReturn > quarterlyReturnRange[1]) return false;
      if (stock.yearlyReturn < yearlyReturnRange[0] || stock.yearlyReturn > yearlyReturnRange[1]) return false;
      
      // Technical filters - Volume
      if (stock.volumeChange < volumeChangeMin) return false;
      if (highVolumeOnly && stock.volumeChange < 50) return false;

      // Fundamental filters
      if (stock.peRatio < peRange[0] || stock.peRatio > peRange[1]) return false;
      if (stock.dividendYield < dividendYieldMin) return false;
      if (stock.roe < roeMin) return false;
      if (stock.debtToEquity > debtToEquityMax) return false;

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: number, bVal: number;
      
      switch (sortField) {
        case "symbol":
          return sortDirection === "asc" 
            ? a.symbol.localeCompare(b.symbol) 
            : b.symbol.localeCompare(a.symbol);
        case "price":
          aVal = prices[a.symbol]?.price || a.marketCap / 100;
          bVal = prices[b.symbol]?.price || b.marketCap / 100;
          break;
        case "change":
          aVal = prices[a.symbol]?.changePercent || 0;
          bVal = prices[b.symbol]?.changePercent || 0;
          break;
        case "marketCap":
          aVal = a.marketCap;
          bVal = b.marketCap;
          break;
        case "peRatio":
          aVal = a.peRatio;
          bVal = b.peRatio;
          break;
        case "dividendYield":
          aVal = a.dividendYield;
          bVal = b.dividendYield;
          break;
        case "rsi":
          aVal = a.rsi;
          bVal = b.rsi;
          break;
        case "roe":
          aVal = a.roe;
          bVal = b.roe;
          break;
        case "macd":
          aVal = a.macdHistogram;
          bVal = b.macdHistogram;
          break;
        case "adx":
          aVal = a.adx;
          bVal = b.adx;
          break;
        case "beta":
          aVal = a.beta;
          bVal = b.beta;
          break;
        case "monthlyReturn":
          aVal = a.monthlyReturn;
          bVal = b.monthlyReturn;
          break;
        default:
          aVal = 0;
          bVal = 0;
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
    const symbols = paginatedStocks.map(s => s.symbol);
    setVisibleSymbols(symbols);
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
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return sortDirection === "asc" 
      ? <ChevronUp className="w-3 h-3 ml-1" /> 
      : <ChevronDown className="w-3 h-3 ml-1" />;
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSector("All");
    setSelectedIndustry("All");
    setSelectedIndex("All");
    setPriceRange([0, 100000]);
    setMarketCapRange([0, 2000000]);
    setRsiRange([0, 100]);
    setNearHighLow("all");
    setSmaFilter("all");
    setPriceVsSma50Range([-50, 50]);
    setPriceVsSma200Range([-50, 50]);
    setMacdFilter("all");
    setAdxRange([0, 100]);
    setStochasticRange([0, 100]);
    setMfiRange([0, 100]);
    setAtrPercentRange([0, 5]);
    setBetaRange([0, 3]);
    setBollingerFilter("all");
    setWeeklyReturnRange([-20, 20]);
    setMonthlyReturnRange([-30, 30]);
    setQuarterlyReturnRange([-50, 50]);
    setYearlyReturnRange([-50, 100]);
    setVolumeChangeMin(-100);
    setHighVolumeOnly(false);
    setPeRange([0, 100]);
    setDividendYieldMin(0);
    setRoeMin(0);
    setDebtToEquityMax(15);
    setActivePreset(null);
    setCurrentPage(1);
  };

  const applyPreset = (presetId: string) => {
    setActivePreset(presetId === activePreset ? null : presetId);
    setCurrentPage(1);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L Cr`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K Cr`;
    return `₹${value.toLocaleString()} Cr`;
  };

  const handleExportCSV = () => {
    const exportData = filteredStocks.map(stock => ({
      ...stock,
      livePrice: prices[stock.symbol]?.price,
      change: prices[stock.symbol]?.change,
      changePercent: prices[stock.symbol]?.changePercent,
    }));
    exportToCSV(exportData);
    toast.success(`Exported ${exportData.length} stocks to CSV`);
  };

  const handleExportExcel = () => {
    const exportData = filteredStocks.map(stock => ({
      ...stock,
      livePrice: prices[stock.symbol]?.price,
      change: prices[stock.symbol]?.change,
      changePercent: prices[stock.symbol]?.changePercent,
    }));
    exportToExcel(exportData);
    toast.success(`Exported ${exportData.length} stocks to Excel`);
  };

  const handleWatchlistToggle = async (stock: StockInfo) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (isInWatchlist(stock.symbol)) {
      await removeFromWatchlist(stock.symbol);
    } else {
      await addToWatchlist(stock.symbol, stock.name);
    }
  };

  const activePresetInfo = presetScreeners.find(p => p.id === activePreset);

  return (
    <div className="py-8 sm:py-12 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Stock Screener
              </h1>
              <p className="text-muted-foreground">
                Screen {allStocks.length}+ Indian stocks with comprehensive filters
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export to CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export to Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Watchlist Toggle */}
              {user && (
                <Button 
                  variant={showWatchlistOnly ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
                  className="gap-2"
                >
                  <Heart className={`w-4 h-4 ${showWatchlistOnly ? 'fill-current' : ''}`} />
                  Watchlist ({watchlist.length})
                </Button>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshPrices}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              {/* User Auth Dropdown */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline max-w-[100px] truncate">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => navigate('/auth')}
                  className="gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          {/* Preset Screeners */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-financial-accent" />
              <span className="text-sm font-medium">Quick Screeners</span>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {presetScreeners.map(preset => (
                  <Button
                    key={preset.id}
                    variant={activePreset === preset.id ? "default" : "outline"}
                    size="sm"
                    className={`whitespace-nowrap text-xs ${activePreset === preset.id ? 'bg-financial-accent hover:bg-financial-accent/90' : ''}`}
                    onClick={() => applyPreset(preset.id)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            {activePresetInfo && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="gap-1">
                  <LineChart className="w-3 h-3" />
                  {activePresetInfo.name}: {activePresetInfo.description}
                  <button onClick={() => setActivePreset(null)} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </div>
            )}
          </div>
          
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Search */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stocks..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Index Filter */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <LineChart className="w-4 h-4" />
                    Index
                  </Label>
                  <Select value={selectedIndex} onValueChange={(v) => { setSelectedIndex(v); setCurrentPage(1); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Indices</SelectItem>
                      {Object.entries(indexDefinitions).map(([key, name]) => (
                        <SelectItem key={key} value={key}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-auto gap-1">
                    <TabsTrigger value="basic" className="text-xs px-2 py-1.5">Basic</TabsTrigger>
                    <TabsTrigger value="technical" className="text-xs px-2 py-1.5">Technical</TabsTrigger>
                    <TabsTrigger value="momentum" className="text-xs px-2 py-1.5">Momentum</TabsTrigger>
                    <TabsTrigger value="fundamental" className="text-xs px-2 py-1.5">Fundamental</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-2 mt-2">
                    {/* Sector */}
                    <div className="space-y-1">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Sector
                      </Label>
                      <Select value={selectedSector} onValueChange={(v) => { setSelectedSector(v); setSelectedIndustry("All"); setCurrentPage(1); }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors.map(sector => (
                            <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Industry */}
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Industry</Label>
                      <Select value={selectedIndustry} onValueChange={(v) => { setSelectedIndustry(v); setCurrentPage(1); }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredIndustries.map(industry => (
                            <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-1">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <IndianRupee className="w-4 h-4" />
                        Price Range
                      </Label>
                      <Slider
                        value={priceRange}
                        onValueChange={(v) => setPriceRange(v as [number, number])}
                        min={0}
                        max={100000}
                        step={500}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>₹{priceRange[0].toLocaleString()}</span>
                        <span>₹{priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Market Cap */}
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Market Cap</Label>
                      <Slider
                        value={marketCapRange}
                        onValueChange={(v) => setMarketCapRange(v as [number, number])}
                        min={0}
                        max={2000000}
                        step={10000}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatMarketCap(marketCapRange[0])}</span>
                        <span>{formatMarketCap(marketCapRange[1])}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer text-xs hover:bg-financial-accent/10"
                          onClick={() => setMarketCapRange([100000, 2000000])}
                        >
                          Large Cap
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer text-xs hover:bg-financial-accent/10"
                          onClick={() => setMarketCapRange([20000, 100000])}
                        >
                          Mid Cap
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer text-xs hover:bg-financial-accent/10"
                          onClick={() => setMarketCapRange([0, 20000])}
                        >
                          Small Cap
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-4 mt-4">
                    {/* Moving Average Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Moving Average
                      </Label>
                      <Select value={smaFilter} onValueChange={setSmaFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Stocks</SelectItem>
                          <SelectItem value="above50">Above 50 DMA</SelectItem>
                          <SelectItem value="below50">Below 50 DMA</SelectItem>
                          <SelectItem value="above200">Above 200 DMA</SelectItem>
                          <SelectItem value="below200">Below 200 DMA</SelectItem>
                          <SelectItem value="goldenCross">Golden Cross (50 &gt; 200)</SelectItem>
                          <SelectItem value="deathCross">Death Cross (50 &lt; 200)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price vs 50 SMA */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Price vs 50 SMA (%)</Label>
                      <Slider
                        value={priceVsSma50Range}
                        onValueChange={(v) => setPriceVsSma50Range(v as [number, number])}
                        min={-50}
                        max={50}
                        step={5}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{priceVsSma50Range[0]}%</span>
                        <span>{priceVsSma50Range[1]}%</span>
                      </div>
                    </div>

                    {/* Near High/Low */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">52-Week Position</Label>
                      <Select value={nearHighLow} onValueChange={setNearHighLow}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Stocks</SelectItem>
                          <SelectItem value="near52High">Near 52-Week High</SelectItem>
                          <SelectItem value="near52Low">Near 52-Week Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Bollinger Bands */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Waves className="w-4 h-4" />
                        Bollinger Bands
                      </Label>
                      <Select value={bollingerFilter} onValueChange={setBollingerFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Stocks</SelectItem>
                          <SelectItem value="nearUpper">Near Upper Band</SelectItem>
                          <SelectItem value="nearLower">Near Lower Band</SelectItem>
                          <SelectItem value="squeeze">Bollinger Squeeze</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Beta Range */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Beta (Volatility)</Label>
                      <Slider
                        value={betaRange}
                        onValueChange={(v) => setBetaRange(v as [number, number])}
                        min={0}
                        max={3}
                        step={0.1}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{betaRange[0].toFixed(1)}</span>
                        <span>{betaRange[1].toFixed(1)}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer text-xs hover:bg-financial-accent/10"
                          onClick={() => setBetaRange([0, 0.8])}
                        >
                          Low Beta
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer text-xs hover:bg-financial-accent/10"
                          onClick={() => setBetaRange([1.2, 3])}
                        >
                          High Beta
                        </Badge>
                      </div>
                    </div>

                    {/* ATR % */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">ATR % (Volatility)</Label>
                      <Slider
                        value={atrPercentRange}
                        onValueChange={(v) => setAtrPercentRange(v as [number, number])}
                        min={0}
                        max={5}
                        step={0.1}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{atrPercentRange[0].toFixed(1)}%</span>
                        <span>{atrPercentRange[1].toFixed(1)}%</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="momentum" className="space-y-4 mt-4">
                    {/* RSI Range */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        RSI (14)
                      </Label>
                      <Slider
                        value={rsiRange}
                        onValueChange={(v) => setRsiRange(v as [number, number])}
                        min={0}
                        max={100}
                        step={5}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{rsiRange[0]}</span>
                        <span>{rsiRange[1]}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge 
                          variant={rsiRange[1] <= 30 ? "default" : "outline"} 
                          className="cursor-pointer text-xs"
                          onClick={() => setRsiRange([0, 30])}
                        >
                          Oversold
                        </Badge>
                        <Badge 
                          variant={rsiRange[0] >= 70 ? "default" : "outline"} 
                          className="cursor-pointer text-xs"
                          onClick={() => setRsiRange([70, 100])}
                        >
                          Overbought
                        </Badge>
                      </div>
                    </div>

                    {/* MACD Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        MACD Signal
                      </Label>
                      <Select value={macdFilter} onValueChange={setMacdFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Stocks</SelectItem>
                          <SelectItem value="bullish">MACD Bullish</SelectItem>
                          <SelectItem value="bearish">MACD Bearish</SelectItem>
                          <SelectItem value="crossover">Near Crossover</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ADX (Trend Strength) */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        ADX (Trend Strength)
                      </Label>
                      <Slider
                        value={adxRange}
                        onValueChange={(v) => setAdxRange(v as [number, number])}
                        min={0}
                        max={100}
                        step={5}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{adxRange[0]}</span>
                        <span>{adxRange[1]}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer text-xs hover:bg-financial-accent/10"
                          onClick={() => setAdxRange([25, 100])}
                        >
                          Strong Trend
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer text-xs hover:bg-financial-accent/10"
                          onClick={() => setAdxRange([0, 20])}
                        >
                          Weak/No Trend
                        </Badge>
                      </div>
                    </div>

                    {/* Stochastic */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Stochastic %K</Label>
                      <Slider
                        value={stochasticRange}
                        onValueChange={(v) => setStochasticRange(v as [number, number])}
                        min={0}
                        max={100}
                        step={5}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{stochasticRange[0]}</span>
                        <span>{stochasticRange[1]}</span>
                      </div>
                    </div>

                    {/* MFI */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Money Flow Index</Label>
                      <Slider
                        value={mfiRange}
                        onValueChange={(v) => setMfiRange(v as [number, number])}
                        min={0}
                        max={100}
                        step={5}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{mfiRange[0]}</span>
                        <span>{mfiRange[1]}</span>
                      </div>
                    </div>

                    {/* Returns */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Monthly Return %
                      </Label>
                      <Slider
                        value={monthlyReturnRange}
                        onValueChange={(v) => setMonthlyReturnRange(v as [number, number])}
                        min={-30}
                        max={30}
                        step={5}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{monthlyReturnRange[0]}%</span>
                        <span>{monthlyReturnRange[1]}%</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer text-xs hover:bg-financial-accent/10"
                          onClick={() => setMonthlyReturnRange([5, 30])}
                        >
                          Gainers
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer text-xs hover:bg-financial-accent/10"
                          onClick={() => setMonthlyReturnRange([-30, -5])}
                        >
                          Losers
                        </Badge>
                      </div>
                    </div>

                    {/* High Volume */}
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="highVolume" 
                        checked={highVolumeOnly}
                        onCheckedChange={(checked) => setHighVolumeOnly(checked as boolean)}
                      />
                      <Label htmlFor="highVolume" className="text-sm cursor-pointer">
                        High volume spikes only (+50%)
                      </Label>
                    </div>
                  </TabsContent>

                  <TabsContent value="fundamental" className="space-y-4 mt-4">
                    {/* P/E Ratio */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">P/E Ratio</Label>
                      <Slider
                        value={peRange}
                        onValueChange={(v) => setPeRange(v as [number, number])}
                        min={0}
                        max={100}
                        step={1}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{peRange[0]}</span>
                        <span>{peRange[1]}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer text-xs hover:bg-financial-accent/10"
                          onClick={() => setPeRange([0, 15])}
                        >
                          Value
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer text-xs hover:bg-financial-accent/10"
                          onClick={() => setPeRange([15, 30])}
                        >
                          Growth
                        </Badge>
                      </div>
                    </div>

                    {/* Dividend Yield */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        Min Dividend Yield
                      </Label>
                      <Slider
                        value={[dividendYieldMin]}
                        onValueChange={(v) => setDividendYieldMin(v[0])}
                        min={0}
                        max={5}
                        step={0.1}
                        className="py-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        {dividendYieldMin.toFixed(1)}%+
                      </div>
                    </div>

                    {/* ROE */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Min ROE</Label>
                      <Slider
                        value={[roeMin]}
                        onValueChange={(v) => setRoeMin(v[0])}
                        min={0}
                        max={50}
                        step={1}
                        className="py-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        {roeMin}%+
                      </div>
                    </div>

                    {/* Debt to Equity */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Max Debt/Equity</Label>
                      <Slider
                        value={[debtToEquityMax]}
                        onValueChange={(v) => setDebtToEquityMax(v[0])}
                        min={0}
                        max={15}
                        step={0.5}
                        className="py-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        ≤ {debtToEquityMax.toFixed(1)}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg">
                    Results ({filteredStocks.length} stocks)
                  </CardTitle>
                  {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Fetching prices...
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-2 w-10"></th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                          <button 
                            className="flex items-center hover:text-foreground transition-colors"
                            onClick={() => handleSort("symbol")}
                          >
                            Stock
                            <SortIcon field="symbol" />
                          </button>
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                          <button 
                            className="flex items-center justify-end ml-auto hover:text-foreground transition-colors"
                            onClick={() => handleSort("price")}
                          >
                            Price
                            <SortIcon field="price" />
                          </button>
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                          <button 
                            className="flex items-center justify-end ml-auto hover:text-foreground transition-colors"
                            onClick={() => handleSort("change")}
                          >
                            Change
                            <SortIcon field="change" />
                          </button>
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                          <button 
                            className="flex items-center justify-end ml-auto hover:text-foreground transition-colors"
                            onClick={() => handleSort("marketCap")}
                          >
                            M.Cap
                            <SortIcon field="marketCap" />
                          </button>
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground hidden md:table-cell">
                          <button 
                            className="flex items-center justify-end ml-auto hover:text-foreground transition-colors"
                            onClick={() => handleSort("peRatio")}
                          >
                            P/E
                            <SortIcon field="peRatio" />
                          </button>
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                          <button 
                            className="flex items-center justify-end ml-auto hover:text-foreground transition-colors"
                            onClick={() => handleSort("dividendYield")}
                          >
                            Div %
                            <SortIcon field="dividendYield" />
                          </button>
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                          <button 
                            className="flex items-center justify-end ml-auto hover:text-foreground transition-colors"
                            onClick={() => handleSort("rsi")}
                          >
                            RSI
                            <SortIcon field="rsi" />
                          </button>
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground hidden xl:table-cell">
                          <button 
                            className="flex items-center justify-end ml-auto hover:text-foreground transition-colors"
                            onClick={() => handleSort("roe")}
                          >
                            ROE
                            <SortIcon field="roe" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStocks.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-8 text-muted-foreground">
                            {showWatchlistOnly && watchlist.length === 0 
                              ? "Your watchlist is empty. Add stocks using the heart icon."
                              : "No stocks match your criteria. Try adjusting the filters."}
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
                              className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedStock(stock);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              <td className="py-3 px-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWatchlistToggle(stock);
                                  }}
                                  className={`p-1.5 rounded-full transition-colors ${
                                    inWatchlist 
                                      ? 'text-rose-500 hover:text-rose-600' 
                                      : 'text-muted-foreground hover:text-rose-500'
                                  }`}
                                  title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                                >
                                  <Heart className={`w-4 h-4 ${inWatchlist ? 'fill-current' : ''}`} />
                                </button>
                              </td>
                              <td className="py-3 px-2">
                                <div>
                                  <div className="font-semibold text-foreground">{stock.symbol}</div>
                                  <div className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[180px]">
                                    {stock.name}
                                  </div>
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    <Badge variant="outline" className="text-xs py-0">
                                      {stock.sector}
                                    </Badge>
                                    {stock.indices.includes("NIFTY50") && (
                                      <Badge variant="secondary" className="text-xs py-0 bg-financial-accent/20 text-financial-accent">
                                        N50
                                      </Badge>
                                    )}
                                    {stock.indices.includes("SENSEX") && (
                                      <Badge variant="secondary" className="text-xs py-0 bg-amber-500/20 text-amber-600">
                                        BSE
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="text-right py-3 px-2">
                                {hasLivePrice ? (
                                  <span className="font-semibold">
                                    ₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-sm">—</span>
                                )}
                              </td>
                              <td className="text-right py-3 px-2">
                                {hasLivePrice ? (
                                  <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {isPositive ? (
                                      <TrendingUp className="w-3 h-3" />
                                    ) : (
                                      <TrendingDown className="w-3 h-3" />
                                    )}
                                    <span className="text-sm font-medium">
                                      {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">—</span>
                                )}
                              </td>
                              <td className="text-right py-3 px-2 text-sm hidden sm:table-cell">
                                {formatMarketCap(stock.marketCap)}
                              </td>
                              <td className="text-right py-3 px-2 text-sm hidden md:table-cell">
                                {stock.peRatio.toFixed(1)}
                              </td>
                              <td className="text-right py-3 px-2 text-sm hidden lg:table-cell">
                                {stock.dividendYield.toFixed(1)}%
                              </td>
                              <td className="text-right py-3 px-2 hidden lg:table-cell">
                                <Badge 
                                  variant={stock.rsi < 30 ? "default" : stock.rsi > 70 ? "destructive" : "secondary"}
                                  className="text-xs"
                                >
                                  {stock.rsi}
                                </Badge>
                              </td>
                              <td className="text-right py-3 px-2 text-sm hidden xl:table-cell">
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
                  <div className="flex items-center justify-between mt-4 pt-4 border-t flex-wrap gap-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredStocks.length)} of {filteredStocks.length}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Stock Detail Modal */}
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
