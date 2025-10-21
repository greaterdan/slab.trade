import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MiniCandleCanvas } from "@/components/shared/MiniCandleCanvas";
import { OrderBook } from "@/components/shared/OrderBook";
import { TradesFeed } from "@/components/shared/TradesFeed";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import type { OrderBook as OrderBookType, Trade } from "@shared/schema";
import { fetchMarketBySymbol, fetchOrderBook, fetchRecentTrades } from "@/lib/api";

export default function Market() {
  const [, params] = useRoute("/market/:symbol");
  const symbol = params?.symbol || "BONK";

  const [chartMode, setChartMode] = useState<"candles" | "twap">("candles");
  const [activeTab, setActiveTab] = useState<"trades" | "funding" | "positions">("trades");
  const [market, setMarket] = useState<any>(null);
  const [orderBook, setOrderBook] = useState<OrderBookType | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);

  // Trade ticket state
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [size, setSize] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [multiplier, setMultiplier] = useState([1]);

  useEffect(() => {
    const loadMarketData = async () => {
      const marketData = await fetchMarketBySymbol(symbol);
      if (marketData) {
        setMarket(marketData);
        const ob = await fetchOrderBook(marketData.id);
        setOrderBook(ob);
        const recentTrades = await fetchRecentTrades(marketData.id);
        setTrades(recentTrades);
        setLimitPrice(marketData.metrics.currentPrice.toFixed(4));
      }
    };

    loadMarketData();

    const interval = setInterval(async () => {
      if (market) {
        const recentTrades = await fetchRecentTrades(market.id);
        setTrades(recentTrades);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [symbol]);

  if (!market || !orderBook) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-12 w-96" />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <LoadingSkeleton className="xl:col-span-6 h-96" />
          <LoadingSkeleton className="xl:col-span-3 h-96" />
          <LoadingSkeleton className="xl:col-span-3 h-96" />
        </div>
      </div>
    );
  }

  const isPriceUp = market.metrics.priceChange24h >= 0;
  const effectiveSize = parseFloat(size || "0") * multiplier[0];
  const total = orderType === "market" 
    ? effectiveSize * market.metrics.currentPrice
    : effectiveSize * parseFloat(limitPrice || "0");

  return (
    <div className="space-y-4 px-4 py-4">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-center text-sm font-bold text-primary">
            {symbol.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-primary">{symbol}</h1>
              <StatusBadge status={market.status} />
            </div>
            <p className="text-xs text-muted-foreground">{market.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <div className="text-muted-foreground mb-1">24H_VOL</div>
            <div className="font-mono font-bold" data-numeric="true">
              ${(market.metrics.volume24h / 1e3).toFixed(0)}K
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">OPEN_INT</div>
            <div className="font-mono font-bold" data-numeric="true">
              ${(market.metrics.openInterest / 1e3).toFixed(0)}K
            </div>
          </div>
          {market.status === "perps" && market.metrics.fundingRate !== undefined && (
            <div>
              <div className="text-muted-foreground mb-1">FUNDING</div>
              <div className="font-mono font-bold text-primary" data-numeric="true">
                {(market.metrics.fundingRate * 100).toFixed(4)}%
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main 3-column layout: Chart | OrderBook | Trade */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left: Chart */}
        <div className="xl:col-span-6 space-y-4">
          <Card className="p-4 border-primary/20 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xl font-bold font-mono" data-numeric="true">
                    ${market.metrics.currentPrice.toFixed(8)}
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${isPriceUp ? "text-success" : "text-destructive"}`}>
                    {isPriceUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="font-mono" data-numeric="true">
                      {isPriceUp ? "+" : ""}{market.metrics.priceChange24h.toFixed(2)}%
                    </span>
                    <span className="text-muted-foreground">24H</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChartMode("candles")}
                  className={`text-[10px] border ${chartMode === "candles" ? "border-primary/50 text-primary" : "border-transparent"}`}
                  data-testid="button-chart-candles"
                >
                  [CANDLES]
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChartMode("twap")}
                  className={`text-[10px] border ${chartMode === "twap" ? "border-primary/50 text-primary" : "border-transparent"}`}
                  data-testid="button-chart-twap"
                >
                  [TWAP]
                </Button>
              </div>
            </div>

            <MiniCandleCanvas height={400} />

            <div className="mt-4 text-[10px] text-muted-foreground text-center">
              &gt; CHART_SYSTEM.INIT [TRADINGVIEW_PENDING]
            </div>
          </Card>
        </div>

        {/* Middle: Order Book */}
        <div className="xl:col-span-3">
          <Card className="border-primary/20 bg-card overflow-hidden h-full">
            <div className="p-3 border-b border-primary/20">
              <h3 className="text-xs font-bold text-primary">ORDER_BOOK.DB</h3>
            </div>
            <OrderBook
              bids={orderBook.bids}
              asks={orderBook.asks}
            />
          </Card>
        </div>

        {/* Right: Trade Panel */}
        <div className="xl:col-span-3">
          <Card className="p-4 border-primary/20 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-primary">TRADE.EXEC</h3>
            </div>

            {/* Order Type Tabs */}
            <Tabs value={orderType} onValueChange={(v) => setOrderType(v as "market" | "limit")} className="mb-4">
              <TabsList className="grid w-full grid-cols-2 bg-background border border-primary/20">
                <TabsTrigger 
                  value="market" 
                  className="text-[10px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  data-testid="tab-market"
                >
                  [MARKET]
                </TabsTrigger>
                <TabsTrigger 
                  value="limit" 
                  className="text-[10px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  data-testid="tab-limit"
                >
                  [LIMIT]
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Buy/Sell Tabs */}
            <Tabs value={side} onValueChange={(v) => setSide(v as "buy" | "sell")} className="mb-4">
              <TabsList className="grid w-full grid-cols-2 bg-background border border-primary/20">
                <TabsTrigger 
                  value="buy" 
                  className="text-[10px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  data-testid="tab-buy"
                >
                  [BUY]
                </TabsTrigger>
                <TabsTrigger 
                  value="sell" 
                  className="text-[10px] data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive"
                  data-testid="tab-sell"
                >
                  [SELL]
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-3">
              {/* Limit Price (only for limit orders) */}
              {orderType === "limit" && (
                <div>
                  <Label htmlFor="limit-price" className="text-[10px] text-muted-foreground mb-1.5 block">
                    LIMIT_PRICE
                  </Label>
                  <Input
                    id="limit-price"
                    type="number"
                    placeholder="0.0000"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="font-mono text-sm h-9 bg-background border-primary/20"
                    data-testid="input-limit-price"
                  />
                </div>
              )}

              {/* Size */}
              <div>
                <Label htmlFor="size-input" className="text-[10px] text-muted-foreground mb-1.5 block">
                  SIZE ({symbol})
                </Label>
                <Input
                  id="size-input"
                  type="number"
                  placeholder="0.00"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="font-mono text-sm h-9 bg-background border-primary/20"
                  data-testid="input-size"
                />
              </div>

              {/* Multiplier Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-[10px] text-muted-foreground">
                    MULTIPLIER
                  </Label>
                  <span className="text-xs font-bold font-mono text-primary" data-numeric="true">
                    {multiplier[0]}x
                  </span>
                </div>
                <Slider
                  value={multiplier}
                  onValueChange={setMultiplier}
                  max={100}
                  min={1}
                  step={1}
                  className="mb-1"
                  data-testid="slider-multiplier"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>1x</span>
                  <span>50x</span>
                  <span>100x</span>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-1.5 text-[10px] p-3 bg-background/50 border border-primary/20">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PRICE</span>
                  <span className="font-mono" data-numeric="true">
                    ${orderType === "market" ? market.metrics.currentPrice.toFixed(4) : (limitPrice || "0.0000")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SIZE</span>
                  <span className="font-mono" data-numeric="true">{size || "0.00"}</span>
                </div>
                {multiplier[0] > 1 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MULTIPLIER</span>
                    <span className="font-mono text-primary" data-numeric="true">{multiplier[0]}x</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">EFFECTIVE_SIZE</span>
                  <span className="font-mono" data-numeric="true">{effectiveSize.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-primary/20">
                  <span className="text-primary">TOTAL</span>
                  <span className="font-mono font-bold text-primary" data-numeric="true">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className={`w-full h-9 font-bold text-[10px] ${
                    side === "buy" 
                      ? "border-primary/30 text-primary hover:bg-primary/10" 
                      : "border-destructive/30 text-destructive hover:bg-destructive/10"
                  }`}
                  disabled={!size || parseFloat(size) <= 0 || (orderType === "limit" && !limitPrice)}
                  data-testid="button-trade-submit"
                >
                  [{orderType.toUpperCase()}_{side.toUpperCase()}]
                </Button>
              </motion.div>

              <div className="text-[9px] text-center text-muted-foreground">
                &gt; CONNECT_WALLET_TO_TRADE
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Tabs */}
      <Card className="border-primary/20 bg-card">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <div className="border-b border-primary/20 px-4">
            <TabsList className="bg-transparent border-0 h-10">
              <TabsTrigger value="trades" className="text-[10px] data-[state=active]:border-b-2 data-[state=active]:border-primary" data-testid="tab-trades">
                [TRADES]
              </TabsTrigger>
              <TabsTrigger value="positions" className="text-[10px] data-[state=active]:border-b-2 data-[state=active]:border-primary" data-testid="tab-positions">
                [POSITIONS]
              </TabsTrigger>
              <TabsTrigger value="orders" className="text-[10px] data-[state=active]:border-b-2 data-[state=active]:border-primary" data-testid="tab-orders">
                [ORDERS]
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trades" className="mt-0">
            <TradesFeed trades={trades} />
          </TabsContent>

          <TabsContent value="positions" className="p-6">
            <div className="text-center py-8 text-muted-foreground text-xs">
              &gt; NO_OPEN_POSITIONS
            </div>
          </TabsContent>

          <TabsContent value="orders" className="p-6">
            <div className="text-center py-8 text-muted-foreground text-xs">
              &gt; NO_OPEN_ORDERS
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
