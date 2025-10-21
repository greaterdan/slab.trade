import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MiniCandleCanvas } from "@/components/shared/MiniCandleCanvas";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KPIStat } from "@/components/shared/KPIStat";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Rocket, TrendingUp, Users, Droplet, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useMarketsStore } from "@/stores/useMarketsStore";
import { fetchMarkets, startRealtimeUpdates, stopRealtimeUpdates } from "@/lib/api";

export default function Dashboard() {
  const { markets, setMarkets, updateMarketMetrics, addTrade } = useMarketsStore();

  useEffect(() => {
    fetchMarkets().then(setMarkets);

    startRealtimeUpdates(
      (marketId, price) => {
        updateMarketMetrics(marketId, { currentPrice: price });
      },
      (trade) => {
        addTrade(trade.marketId, trade);
      }
    );

    return () => {
      stopRealtimeUpdates();
    };
  }, []);

  if (!markets.length) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <LoadingSkeleton className="h-96" />
          </div>
          <div className="lg:col-span-4">
            <LoadingSkeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  const featuredMarket = markets[0];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-solana-mint via-solana-aqua to-solana-purple bg-clip-text text-transparent">
          Welcome to SLAB
        </h1>
        <p className="text-muted-foreground">
          Launch perpetual markets with bonding curves. Trade, create, discover.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          className="lg:col-span-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6 border-card-border bg-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{featuredMarket.symbol}</h2>
                <p className="text-sm text-muted-foreground">{featuredMarket.name}</p>
              </div>
              <StatusBadge status={featuredMarket.status} />
            </div>

            <MiniCandleCanvas height={120} className="mb-6" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <KPIStat
                icon={Droplet}
                label="Liquidity"
                value={`$${(featuredMarket.metrics.liquidity / 1e6).toFixed(2)}M`}
                trend="up"
              />
              <KPIStat
                icon={Users}
                label="Holders"
                value={featuredMarket.metrics.holders}
                trend="up"
              />
              <KPIStat
                icon={Clock}
                label="Age"
                value={`${featuredMarket.metrics.ageHours}h`}
                trend="neutral"
              />
              <KPIStat
                icon={TrendingUp}
                label="24h Change"
                value={`${featuredMarket.metrics.priceChange24h > 0 ? "+" : ""}${featuredMarket.metrics.priceChange24h.toFixed(2)}%`}
                trend={featuredMarket.metrics.priceChange24h >= 0 ? "up" : "down"}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/10 rounded-md border border-border">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Graduation Progress</span>
                  <span className="text-sm font-bold text-primary">{featuredMarket.metrics.graduationProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-solana-purple via-solana-aqua to-solana-mint"
                    initial={{ width: 0 }}
                    animate={{ width: `${featuredMarket.metrics.graduationProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              <ProgressRing progress={featuredMarket.metrics.graduationProgress} size={60} className="ml-4" />
            </div>

            <Link href={`/market/${featuredMarket.symbol}`}>
              <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-view-market">
                View Market
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6 border-card-border bg-gradient-to-br from-card via-card to-accent/5 h-full flex flex-col">
            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-solana-mint to-solana-purple flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-bold mb-2">Launch Your Market</h3>
            <p className="text-sm text-muted-foreground mb-6 flex-1">
              Create a perpetual market with a custom bonding curve. Earn fees from every trade and graduation.
            </p>
            <Link href="/launch">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-launch-market">
                Launch Market
                <Rocket className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="border-card-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">All Markets</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left p-3 font-medium">Market</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">→Graduation</th>
                  <th className="text-right p-3 font-medium">24h Vol</th>
                  <th className="text-right p-3 font-medium">OI</th>
                  <th className="text-right p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((market, index) => (
                  <motion.tr
                    key={market.id}
                    className="border-b border-border/50 last:border-0 hover-elevate"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    data-testid={`row-market-${market.symbol}`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-solana-purple to-solana-mint flex items-center justify-center text-xs font-bold">
                          {market.symbol.slice(0, 2)}
                        </div>
                        <span className="font-semibold">{market.symbol}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={market.status} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${market.metrics.graduationProgress}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm" data-numeric="true">{market.metrics.graduationProgress}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono" data-numeric="true">
                      ${(market.metrics.volume24h / 1e3).toFixed(0)}K
                    </td>
                    <td className="p-3 text-right font-mono" data-numeric="true">
                      ${(market.metrics.openInterest / 1e3).toFixed(0)}K
                    </td>
                    <td className="p-3 text-right">
                      <Link href={`/market/${market.symbol}`}>
                        <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10" data-testid={`button-trade-${market.symbol}`}>
                          {market.status === "bonding" ? "Buy" : "Trade"}
                        </Button>
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
