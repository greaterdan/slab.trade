import { useState, useEffect } from "react";
import { MarketTile } from "@/components/shared/MarketTile";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import type { MarketStatus } from "@shared/schema";
import { useMarketsStore } from "@/stores/useMarketsStore";
import { fetchMarkets } from "@/lib/api";

export default function Discover() {
  const { markets, setMarkets } = useMarketsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MarketStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"volume" | "time" | "progress">("volume");

  useEffect(() => {
    fetchMarkets().then(setMarkets);
  }, []);

  const filteredMarkets = markets
    .filter(m => statusFilter === "all" || m.status === statusFilter)
    .filter(m => m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "volume") return b.metrics.volume24h - a.metrics.volume24h;
      if (sortBy === "time") return b.createdAt - a.createdAt;
      return b.metrics.graduationProgress - a.metrics.graduationProgress;
    });

  if (!markets.length) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-64" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-2">Discover Markets</h1>
        <p className="text-muted-foreground">
          Explore all bonding curves and perpetual markets
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-markets"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as MarketStatus | "all")}>
          <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="bonding">Bonding</SelectItem>
            <SelectItem value="warmup">Warmup</SelectItem>
            <SelectItem value="perps">Perps Live</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as "volume" | "time" | "progress")}>
          <SelectTrigger className="w-full sm:w-40" data-testid="select-sort">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="volume">Volume</SelectItem>
            <SelectItem value="time">Recent</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {filteredMarkets.map((market, index) => (
          <motion.div
            key={market.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <MarketTile market={market} />
          </motion.div>
        ))}
      </motion.div>

      {filteredMarkets.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No markets found</p>
        </div>
      )}
    </div>
  );
}
