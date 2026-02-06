import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStockPrices } from "@/hooks/useStockPrices";
import { allStocks, sectors, industries, presetScreeners, indexDefinitions, StockInfo } from "@/data/stockDatabase";
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
  X
} from "lucide-react";

type SortField = "symbol" | "price" | "change" | "marketCap" | "peRatio" | "dividendYield" | "rsi" | "roe";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 50;

const StockScreener = () => {
  const [visibleSymbols, setVisibleSymbols] = useState<string[]>([]);
  const { prices, isLoading, error, lastUpdated, refreshPrices } = useStockPrices(visibleSymbols);

  // Preset screener selection
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Basic filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [marketCapRange, setMarketCapRange] = useState<[number, number]>([0, 2000000]);

  // Technical filters
  const [rsiRange, setRsiRange] = useState<[number, number]>([0, 100]);
  const [nearHighLow, setNearHighLow] = useState<string>("all");

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

      // Technical filters
      if (stock.rsi < rsiRange[0] || stock.rsi > rsiRange[1]) return false;
      if (nearHighLow === "near52High" && price < stock.high52Week * 0.95) return false;
      if (nearHighLow === "near52Low" && price > stock.low52Week * 1.05) return false;

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
        default:
          aVal = 0;
          bVal = 0;
      }
      
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [prices, searchQuery, selectedSector, selectedIndustry, selectedIndex, priceRange, marketCapRange, rsiRange, nearHighLow, peRange, dividendYieldMin, roeMin, debtToEquityMax, sortField, sortDirection, activePreset]);

  const paginatedStocks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStocks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStocks, currentPage]);

  const totalPages = Math.ceil(filteredStocks.length / ITEMS_PER_PAGE);

  useMemo(() => {
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
            <div className="flex items-center gap-3">
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
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

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
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                  <TabsList className="grid w-full grid-cols-3 h-auto">
                    <TabsTrigger value="basic" className="text-xs px-2 py-1.5">Basic</TabsTrigger>
                    <TabsTrigger value="technical" className="text-xs px-2 py-1.5">Technical</TabsTrigger>
                    <TabsTrigger value="fundamental" className="text-xs px-2 py-1.5">Fundamental</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    {/* Sector */}
                    <div className="space-y-2">
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
                    <div className="space-y-2">
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
                    <div className="space-y-3">
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
                    <div className="space-y-3">
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
                    {/* RSI Range */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        RSI Range
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

                    {/* Near High/Low */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Price Position</Label>
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
                          <td colSpan={8} className="text-center py-8 text-muted-foreground">
                            No stocks match your criteria. Try adjusting the filters.
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

                          return (
                            <tr key={stock.symbol} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
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
    </div>
  );
};

export default StockScreener;
