import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStockPrices } from "@/hooks/useStockPrices";
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
  ArrowUpDown
} from "lucide-react";

// Extended stock data with fundamental and technical indicators
interface StockData {
  symbol: string;
  name: string;
  sector: string;
  marketCap: number; // in Crores
  peRatio: number;
  pbRatio: number;
  eps: number;
  dividendYield: number;
  debtToEquity: number;
  roe: number;
  rsi: number;
  movingAvg50: number;
  movingAvg200: number;
  high52Week: number;
  low52Week: number;
  avgVolume: number;
}

// Sample stock database with fundamental data
const stockDatabase: StockData[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", marketCap: 1850000, peRatio: 26.5, pbRatio: 2.1, eps: 98.5, dividendYield: 0.4, debtToEquity: 0.45, roe: 9.2, rsi: 58, movingAvg50: 2850, movingAvg200: 2720, high52Week: 3025, low52Week: 2220, avgVolume: 8500000 },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT", marketCap: 1520000, peRatio: 32.8, pbRatio: 14.2, eps: 125.6, dividendYield: 1.2, debtToEquity: 0.05, roe: 48.5, rsi: 52, movingAvg50: 4150, movingAvg200: 3980, high52Week: 4450, low52Week: 3450, avgVolume: 2100000 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", marketCap: 1180000, peRatio: 19.2, pbRatio: 2.8, eps: 85.4, dividendYield: 1.1, debtToEquity: 6.8, roe: 16.8, rsi: 45, movingAvg50: 1650, movingAvg200: 1580, high52Week: 1795, low52Week: 1420, avgVolume: 12000000 },
  { symbol: "INFY", name: "Infosys", sector: "IT", marketCap: 720000, peRatio: 28.5, pbRatio: 8.5, eps: 62.3, dividendYield: 2.5, debtToEquity: 0.08, roe: 32.4, rsi: 48, movingAvg50: 1780, movingAvg200: 1720, high52Week: 1950, low52Week: 1420, avgVolume: 9500000 },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking", marketCap: 850000, peRatio: 18.5, pbRatio: 3.2, eps: 65.8, dividendYield: 0.8, debtToEquity: 6.2, roe: 18.2, rsi: 62, movingAvg50: 1220, movingAvg200: 1150, high52Week: 1340, low52Week: 980, avgVolume: 15000000 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", sector: "FMCG", marketCap: 580000, peRatio: 58.2, pbRatio: 11.5, eps: 42.5, dividendYield: 1.6, debtToEquity: 0.02, roe: 20.5, rsi: 38, movingAvg50: 2480, movingAvg200: 2550, high52Week: 2850, low52Week: 2350, avgVolume: 1800000 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom", marketCap: 920000, peRatio: 78.5, pbRatio: 6.8, eps: 22.4, dividendYield: 0.5, debtToEquity: 1.45, roe: 12.8, rsi: 72, movingAvg50: 1750, movingAvg200: 1580, high52Week: 1850, low52Week: 1180, avgVolume: 4500000 },
  { symbol: "ITC", name: "ITC Limited", sector: "FMCG", marketCap: 580000, peRatio: 28.5, pbRatio: 8.2, eps: 16.8, dividendYield: 3.2, debtToEquity: 0.01, roe: 28.5, rsi: 55, movingAvg50: 475, movingAvg200: 445, high52Week: 510, low52Week: 395, avgVolume: 22000000 },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking", marketCap: 720000, peRatio: 11.2, pbRatio: 1.8, eps: 72.5, dividendYield: 1.5, debtToEquity: 12.5, roe: 18.5, rsi: 58, movingAvg50: 815, movingAvg200: 780, high52Week: 912, low52Week: 620, avgVolume: 25000000 },
  { symbol: "WIPRO", name: "Wipro", sector: "IT", marketCap: 280000, peRatio: 24.5, pbRatio: 3.8, eps: 22.4, dividendYield: 0.2, debtToEquity: 0.18, roe: 16.2, rsi: 42, movingAvg50: 545, movingAvg200: 520, high52Week: 580, low52Week: 405, avgVolume: 8500000 },
  { symbol: "MARUTI", name: "Maruti Suzuki", sector: "Auto", marketCap: 420000, peRatio: 32.5, pbRatio: 5.2, eps: 412.5, dividendYield: 0.7, debtToEquity: 0.02, roe: 16.8, rsi: 65, movingAvg50: 13200, movingAvg200: 12500, high52Week: 14250, low52Week: 10200, avgVolume: 650000 },
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto", marketCap: 380000, peRatio: 8.5, pbRatio: 3.2, eps: 118.5, dividendYield: 0.3, debtToEquity: 1.85, roe: 28.5, rsi: 48, movingAvg50: 1020, movingAvg200: 980, high52Week: 1180, low52Week: 680, avgVolume: 18000000 },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", sector: "Pharma", marketCap: 420000, peRatio: 38.5, pbRatio: 4.8, eps: 45.2, dividendYield: 0.6, debtToEquity: 0.12, roe: 14.5, rsi: 58, movingAvg50: 1720, movingAvg200: 1650, high52Week: 1850, low52Week: 1280, avgVolume: 3200000 },
  { symbol: "DRREDDY", name: "Dr. Reddy's Labs", sector: "Pharma", marketCap: 115000, peRatio: 22.8, pbRatio: 4.2, eps: 302.5, dividendYield: 0.5, debtToEquity: 0.15, roe: 18.2, rsi: 52, movingAvg50: 6850, movingAvg200: 6520, high52Week: 7250, low52Week: 5420, avgVolume: 420000 },
  { symbol: "TATASTEEL", name: "Tata Steel", sector: "Metals", marketCap: 185000, peRatio: 65.2, pbRatio: 1.5, eps: 2.35, dividendYield: 2.8, debtToEquity: 0.85, roe: 5.2, rsi: 38, movingAvg50: 152, movingAvg200: 145, high52Week: 185, low52Week: 118, avgVolume: 45000000 },
  { symbol: "ADANIENT", name: "Adani Enterprises", sector: "Diversified", marketCap: 380000, peRatio: 95.5, pbRatio: 12.5, eps: 35.2, dividendYield: 0.1, debtToEquity: 1.25, roe: 15.8, rsi: 42, movingAvg50: 3350, movingAvg200: 3180, high52Week: 3850, low52Week: 2150, avgVolume: 2800000 },
  { symbol: "POWERGRID", name: "Power Grid Corp", sector: "Power", marketCap: 320000, peRatio: 18.5, pbRatio: 2.8, eps: 18.5, dividendYield: 4.2, debtToEquity: 2.15, roe: 18.5, rsi: 62, movingAvg50: 345, movingAvg200: 328, high52Week: 365, low52Week: 280, avgVolume: 12000000 },
  { symbol: "NTPC", name: "NTPC Limited", sector: "Power", marketCap: 385000, peRatio: 16.8, pbRatio: 2.2, eps: 23.5, dividendYield: 2.5, debtToEquity: 1.45, roe: 14.2, rsi: 55, movingAvg50: 395, movingAvg200: 375, high52Week: 420, low52Week: 295, avgVolume: 18000000 },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", sector: "NBFC", marketCap: 480000, peRatio: 35.5, pbRatio: 7.2, eps: 218.5, dividendYield: 0.4, debtToEquity: 3.85, roe: 22.5, rsi: 48, movingAvg50: 7750, movingAvg200: 7420, high52Week: 8450, low52Week: 6250, avgVolume: 1200000 },
  { symbol: "AXISBANK", name: "Axis Bank", sector: "Banking", marketCap: 385000, peRatio: 14.5, pbRatio: 2.2, eps: 85.2, dividendYield: 0.1, debtToEquity: 8.5, roe: 16.8, rsi: 52, movingAvg50: 1235, movingAvg200: 1180, high52Week: 1340, low52Week: 985, avgVolume: 14000000 },
];

const sectors = ["All", "IT", "Banking", "FMCG", "Auto", "Pharma", "Energy", "Telecom", "Metals", "Power", "NBFC", "Diversified"];

type SortField = "symbol" | "price" | "change" | "marketCap" | "peRatio" | "dividendYield" | "rsi" | "roe";
type SortDirection = "asc" | "desc";

const StockScreener = () => {
  const symbols = stockDatabase.map(s => s.symbol);
  const { prices, isLoading, error, lastUpdated, refreshPrices } = useStockPrices(symbols);

  // Basic filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
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

  const filteredStocks = useMemo(() => {
    return stockDatabase.filter(stock => {
      const price = prices[stock.symbol]?.price || 0;

      // Basic filters
      if (searchQuery && !stock.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedSector !== "All" && stock.sector !== selectedSector) return false;
      if (price < priceRange[0] || price > priceRange[1]) return false;
      if (stock.marketCap < marketCapRange[0] || stock.marketCap > marketCapRange[1]) return false;

      // Technical filters
      if (stock.rsi < rsiRange[0] || stock.rsi > rsiRange[1]) return false;
      if (nearHighLow === "near52High" && price < stock.high52Week * 0.95) return false;
      if (nearHighLow === "near52Low" && price > stock.low52Week * 1.05) return false;
      if (nearHighLow === "above50MA" && price < stock.movingAvg50) return false;
      if (nearHighLow === "above200MA" && price < stock.movingAvg200) return false;

      // Fundamental filters
      if (stock.peRatio < peRange[0] || stock.peRatio > peRange[1]) return false;
      if (stock.dividendYield < dividendYieldMin) return false;
      if (stock.roe < roeMin) return false;
      if (stock.debtToEquity > debtToEquityMax) return false;

      return true;
    }).sort((a, b) => {
      let aVal: number, bVal: number;
      
      switch (sortField) {
        case "symbol":
          return sortDirection === "asc" 
            ? a.symbol.localeCompare(b.symbol) 
            : b.symbol.localeCompare(a.symbol);
        case "price":
          aVal = prices[a.symbol]?.price || 0;
          bVal = prices[b.symbol]?.price || 0;
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
  }, [prices, searchQuery, selectedSector, priceRange, marketCapRange, rsiRange, nearHighLow, peRange, dividendYieldMin, roeMin, debtToEquityMax, sortField, sortDirection]);

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
    setPriceRange([0, 20000]);
    setMarketCapRange([0, 2000000]);
    setRsiRange([0, 100]);
    setNearHighLow("all");
    setPeRange([0, 100]);
    setDividendYieldMin(0);
    setRoeMin(0);
    setDebtToEquityMax(15);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L Cr`;
    return `₹${value.toLocaleString()} Cr`;
  };

  return (
    <div className="py-8 sm:py-12 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Stock Screener
              </h1>
              <p className="text-muted-foreground">
                Filter and discover stocks using comprehensive screening criteria
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
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
                      <Select value={selectedSector} onValueChange={setSelectedSector}>
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
                        max={20000}
                        step={100}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>₹{priceRange[0].toLocaleString()}</span>
                        <span>₹{priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Market Cap */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Market Cap (Cr)</Label>
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
                          Oversold (&lt;30)
                        </Badge>
                        <Badge 
                          variant={rsiRange[0] >= 70 ? "default" : "outline"} 
                          className="cursor-pointer text-xs"
                          onClick={() => setRsiRange([70, 100])}
                        >
                          Overbought (&gt;70)
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
                          <SelectItem value="above50MA">Above 50-Day MA</SelectItem>
                          <SelectItem value="above200MA">Above 200-Day MA</SelectItem>
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Results ({filteredStocks.length} stocks)
                  </CardTitle>
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
                      {isLoading && filteredStocks.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-muted-foreground">
                            Loading stock data...
                          </td>
                        </tr>
                      ) : filteredStocks.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-muted-foreground">
                            No stocks match your criteria. Try adjusting the filters.
                          </td>
                        </tr>
                      ) : (
                        filteredStocks.map(stock => {
                          const priceData = prices[stock.symbol];
                          const price = priceData?.price || 0;
                          const change = priceData?.change || 0;
                          const changePercent = priceData?.changePercent || 0;
                          const isPositive = change >= 0;

                          return (
                            <tr key={stock.symbol} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                              <td className="py-3 px-2">
                                <div>
                                  <div className="font-semibold text-foreground">{stock.symbol}</div>
                                  <div className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[180px]">
                                    {stock.name}
                                  </div>
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    {stock.sector}
                                  </Badge>
                                </div>
                              </td>
                              <td className="text-right py-3 px-2">
                                <span className="font-semibold">
                                  ₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </span>
                              </td>
                              <td className="text-right py-3 px-2">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockScreener;
