import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MiniCandleCanvas } from "@/components/shared/MiniCandleCanvas";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KPIStat } from "@/components/shared/KPIStat";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Rocket, TrendingUp, Users, Droplet, Clock } from "lucide-react";
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
    <div className="space-y-6 px-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold mb-2 text-primary">
          $ SLAB/TERMINAL
        </h1>
        <p className="text-muted-foreground text-sm">
          &gt; LAUNCH PERPETUAL MARKETS WITH BONDING CURVES
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          className="lg:col-span-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6 border-primary/20 bg-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1 text-primary">{featuredMarket.symbol}</h2>
                <p className="text-xs text-muted-foreground">{featuredMarket.name}</p>
              </div>
              <StatusBadge status={featuredMarket.status} />
            </div>

            <MiniCandleCanvas height={120} className="mb-6" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <KPIStat
                icon={Droplet}
                label="LIQUIDITY"
                value={`$${(featuredMarket.metrics.liquidity / 1e6).toFixed(2)}M`}
                trend="up"
              />
              <KPIStat
                icon={Users}
                label="HOLDERS"
                value={featuredMarket.metrics.holders}
                trend="up"
              />
              <KPIStat
                icon={Clock}
                label="AGE"
                value={`${featuredMarket.metrics.ageHours}h`}
                trend="neutral"
              />
              <KPIStat
                icon={TrendingUp}
                label="24H CHG"
                value={`${featuredMarket.metrics.priceChange24h > 0 ? "+" : ""}${featuredMarket.metrics.priceChange24h.toFixed(2)}%`}
                trend={featuredMarket.metrics.priceChange24h >= 0 ? "up" : "down"}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-background/50 border border-primary/20">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">GRADUATION PROGRESS</span>
                  <span className="text-xs font-bold text-primary">{featuredMarket.metrics.graduationProgress}%</span>
                </div>
                <div className="h-1 bg-muted/20 border border-primary/20 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${featuredMarket.metrics.graduationProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              <ProgressRing progress={featuredMarket.metrics.graduationProgress} size={60} className="ml-4" />
            </div>

            <Link href={`/market/${featuredMarket.symbol}`}>
              <Button className="w-full mt-4 border-primary/30 bg-transparent text-primary hover:bg-primary/10" variant="outline" data-testid="button-view-market">
                [VIEW MARKET]
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
          <Card className="p-6 border-primary/20 bg-card h-full flex flex-col">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 rounded-md">
              <img src="/slablogo.png" alt="SLAB Logo" className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2 text-primary">LAUNCH SLAB</h3>
            <p className="text-xs text-muted-foreground mb-6 flex-1">
              &gt; Create perpetual market with custom bonding curve
              <br />
              &gt; Earn fees from trades and graduation
            </p>
            <Link href="/launch">
              <Button className="w-full border-primary/30 bg-transparent text-primary hover:bg-primary/10" variant="outline" data-testid="button-launch-market">
                [LAUNCH]
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
        <Card className="border-primary/20 bg-card overflow-hidden">
          <div className="p-4 border-b border-primary/20">
            <h2 className="text-sm font-bold text-primary">ALL_MARKETS.DB</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-primary/20 text-muted-foreground">
                  <th className="text-left p-3 font-medium">MARKET</th>
                  <th className="text-left p-3 font-medium">STATUS</th>
                  <th className="text-right p-3 font-medium">GRAD%</th>
                  <th className="text-right p-3 font-medium">24H_VOL</th>
                  <th className="text-right p-3 font-medium">OPEN_INT</th>
                  <th className="text-right p-3 font-medium">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((market, index) => (
                  <motion.tr
                    key={market.id}
                    className="border-b border-primary/10 last:border-0 hover:bg-primary/5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    data-testid={`row-market-${market.symbol}`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-primary/10 border border-primary/20 rounded flex items-center justify-center text-[10px] font-bold text-primary">
                          {market.symbol.slice(0, 2)}
                        </div>
                        <span className="font-bold text-primary">{market.symbol}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={market.status} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-1 bg-background border border-primary/20 overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${market.metrics.graduationProgress}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground" data-numeric="true">{market.metrics.graduationProgress}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono text-muted-foreground" data-numeric="true">
                      ${(market.metrics.volume24h / 1e3).toFixed(0)}K
                    </td>
                    <td className="p-3 text-right font-mono text-muted-foreground" data-numeric="true">
                      ${(market.metrics.openInterest / 1e3).toFixed(0)}K
                    </td>
                    <td className="p-3 text-right">
                      <Link href={`/market/${market.symbol}`}>
                        <Button variant="ghost" size="sm" className="border border-primary/20 text-primary hover:bg-primary/10 text-[10px]" data-testid={`button-trade-${market.symbol}`}>
                          {market.status === "bonding" ? "[BUY]" : "[TRADE]"}
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
