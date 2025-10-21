import { Market } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { ProgressRing } from "./ProgressRing";
import { TrendingUp, TrendingDown, Users, Droplet } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface MarketTileProps {
  market: Market;
  className?: string;
}

export function MarketTile({ market, className = "" }: MarketTileProps) {
  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
    return `$${num.toFixed(decimals)}`;
  };

  const isPriceUp = market.metrics.priceChange24h >= 0;

  return (
    <Link href={`/market/${market.symbol}`}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15 }}
        className={className}
      >
        <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer border border-card-border bg-card" data-testid={`card-market-${market.symbol}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {market.imageUrl ? (
                <img src={market.imageUrl} alt={market.symbol} className="w-10 h-10 rounded-md" />
              ) : (
                <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {market.symbol.slice(0, 2)}
                </div>
              )}
              <div>
                <h3 className="font-bold text-sm">{market.symbol}</h3>
                <p className="text-xs text-muted-foreground">{market.name}</p>
              </div>
            </div>
            <StatusBadge status={market.status} />
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xl font-bold font-mono" data-numeric="true">
                {formatNumber(market.metrics.currentPrice)}
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${isPriceUp ? "text-success" : "text-destructive"}`}>
                {isPriceUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPriceUp ? "+" : ""}{market.metrics.priceChange24h.toFixed(2)}%
              </div>
            </div>
            <ProgressRing progress={market.metrics.graduationProgress} size={50} strokeWidth={3} />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Droplet className="w-3 h-3" />
                <span>Vol 24h</span>
              </div>
              <div className="text-xs font-medium font-mono" data-numeric="true">
                {formatNumber(market.metrics.volume24h)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <TrendingUp className="w-3 h-3" />
                <span>OI</span>
              </div>
              <div className="text-xs font-medium font-mono" data-numeric="true">
                {formatNumber(market.metrics.openInterest)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Users className="w-3 h-3" />
                <span>Holders</span>
              </div>
              <div className="text-xs font-medium font-mono" data-numeric="true">
                {market.metrics.holders}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
