import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MiniCandleCanvas } from "@/components/shared/MiniCandleCanvas";
import { OrderBook } from "@/components/shared/OrderBook";
import { TradesFeed } from "@/components/shared/TradesFeed";
import { BondingPanel } from "@/components/trading/BondingPanel";
import { PerpsTicket } from "@/components/trading/PerpsTicket";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import type { MarketStatus, OrderBook as OrderBookType, Trade } from "@shared/schema";
import { fetchMarketBySymbol, fetchOrderBook, fetchRecentTrades } from "@/lib/api";

export default function Market() {
  const [, params] = useRoute("/market/:symbol");
  const symbol = params?.symbol || "BONK";

  const [chartMode, setChartMode] = useState<"candles" | "twap">("candles");
  const [activeTab, setActiveTab] = useState<"trades" | "funding" | "positions">("trades");
  const [market, setMarket] = useState<any>(null);
  const [orderBook, setOrderBook] = useState<OrderBookType | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const loadMarketData = async () => {
      const marketData = await fetchMarketBySymbol(symbol);
      if (marketData) {
        setMarket(marketData);
        const ob = await fetchOrderBook(marketData.id);
        setOrderBook(ob);
        const recentTrades = await fetchRecentTrades(marketData.id);
        setTrades(recentTrades);
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
          <div className="xl:col-span-8 space-y-4">
            <LoadingSkeleton className="h-96" />
            <LoadingSkeleton className="h-64" />
          </div>
          <div className="xl:col-span-4 space-y-4">
            <LoadingSkeleton className="h-96" />
            <LoadingSkeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  const isPriceUp = market.metrics.priceChange24h >= 0;

  return (
    <div className="space-y-4">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-gradient-to-br from-solana-purple to-solana-mint flex items-center justify-center text-lg font-bold">
            {symbol.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{symbol}</h1>
              <StatusBadge status={market.status} />
            </div>
            <p className="text-sm text-muted-foreground">{market.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">24h Volume</div>
            <div className="text-lg font-mono font-bold" data-numeric="true">
              ${(market.metrics.volume24h / 1e3).toFixed(0)}K
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Open Interest</div>
            <div className="text-lg font-mono font-bold" data-numeric="true">
              ${(market.metrics.openInterest / 1e3).toFixed(0)}K
            </div>
          </div>
          {market.status === "perps" && market.metrics.fundingRate !== undefined && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Funding Rate</div>
              <div className="text-lg font-mono font-bold text-primary" data-numeric="true">
                {(market.metrics.fundingRate * 100).toFixed(4)}%
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 space-y-4">
          <Card className="p-4 border-card-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-2xl font-bold font-mono" data-numeric="true">
                    ${market.metrics.currentPrice.toFixed(8)}
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${isPriceUp ? "text-success" : "text-destructive"}`}>
                    {isPriceUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="font-mono" data-numeric="true">
                      {isPriceUp ? "+" : ""}{market.metrics.priceChange24h.toFixed(2)}%
                    </span>
                    <span className="text-muted-foreground">24h</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={chartMode === "candles" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartMode("candles")}
                  className="text-xs"
                  data-testid="button-chart-candles"
                >
                  Candles
                </Button>
                <Button
                  variant={chartMode === "twap" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartMode("twap")}
                  className="text-xs"
                  data-testid="button-chart-twap"
                >
                  TWAP
                </Button>
              </div>
            </div>

            <MiniCandleCanvas height={300} />

            <div className="mt-4 text-xs text-muted-foreground text-center">
              Chart placeholder • TradingView integration pending
            </div>
          </Card>

          <Card className="border-card-border bg-card">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <div className="border-b border-border px-4">
                <TabsList className="bg-transparent border-0 h-12">
                  <TabsTrigger value="trades" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none" data-testid="tab-trades">
                    Trades
                  </TabsTrigger>
                  <TabsTrigger value="funding" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none" data-testid="tab-funding">
                    Funding
                  </TabsTrigger>
                  <TabsTrigger value="positions" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none" data-testid="tab-positions">
                    Positions
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="trades" className="mt-0">
                <TradesFeed trades={trades} />
              </TabsContent>

              <TabsContent value="funding" className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  Funding rate history (mock)
                </div>
              </TabsContent>

              <TabsContent value="positions" className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  Open positions will appear here
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="xl:col-span-4 space-y-4">
          {market.status === "bonding" ? (
            <BondingPanel
              symbol={symbol}
              currentPrice={market.metrics.currentPrice}
              creatorTax={market.bondingConfig.creatorTax}
              protocolTax={market.bondingConfig.protocolTax}
              seedVaultTax={market.bondingConfig.seedVaultTax}
            />
          ) : (
            <PerpsTicket
              symbol={symbol}
              currentPrice={market.metrics.currentPrice}
              maxLeverage={market.perpsConfig.maxLeverage}
              takerFeeBps={market.fees.takerBps}
              isWarmup={market.status === "warmup"}
              shortLevCap={market.perpsConfig.warmupShortLevCap}
            />
          )}

          <Card className="border-card-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold">Order Book</h3>
            </div>
            <OrderBook
              bids={orderBook.bids}
              asks={orderBook.asks}
            />
          </Card>
        </div>
      </div>

      <Card className="border-card-border bg-card">
        <Tabs defaultValue="balances">
          <div className="border-b border-border px-4">
            <TabsList className="bg-transparent border-0 h-12">
              <TabsTrigger value="balances" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none" data-testid="tab-balances">
                Balances
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none" data-testid="tab-orders">
                Open Orders
              </TabsTrigger>
              <TabsTrigger value="twap" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none" data-testid="tab-twap-orders">
                TWAP
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none" data-testid="tab-history">
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="balances" className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              Connect wallet to view balances
            </div>
          </TabsContent>

          <TabsContent value="orders" className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              No open orders
            </div>
          </TabsContent>

          <TabsContent value="twap" className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              TWAP orders (mock)
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              Trade history (mock)
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
