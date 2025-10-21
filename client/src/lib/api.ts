import type { Market, OrderBook, Trade } from "@shared/schema";
import marketsData from "@/mocks/markets.json";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchMarkets(): Promise<Market[]> {
  await delay(300);
  return marketsData as Market[];
}

export async function fetchMarketBySymbol(symbol: string): Promise<Market | null> {
  await delay(200);
  const market = (marketsData as Market[]).find(m => m.symbol === symbol);
  return market || null;
}

export async function fetchOrderBook(marketId: string): Promise<OrderBook> {
  await delay(150);
  
  const basePrice = 0.00001234;
  const bids = Array.from({ length: 20 }, (_, i) => ({
    price: basePrice * (1 - (i + 1) * 0.0005),
    size: 1000 + Math.random() * 5000,
    total: 1000 + (i + 1) * 1000,
  }));
  
  const asks = Array.from({ length: 20 }, (_, i) => ({
    price: basePrice * (1 + (i + 1) * 0.0005),
    size: 1000 + Math.random() * 5000,
    total: 1000 + (i + 1) * 1000,
  }));

  return {
    marketId,
    bids,
    asks,
    lastUpdate: Date.now(),
  };
}

export async function fetchRecentTrades(marketId: string): Promise<Trade[]> {
  await delay(150);
  
  return Array.from({ length: 30 }, (_, i) => ({
    id: `trade-${marketId}-${i}-${Date.now()}`,
    marketId,
    symbol: marketId.replace("market-", "").toUpperCase(),
    timestamp: Date.now() - i * 5000,
    price: 0.00001234 * (1 + (Math.random() - 0.5) * 0.02),
    size: 100 + Math.random() * 500,
    side: Math.random() > 0.5 ? "buy" : "sell",
  }));
}

export async function simulateTrade(
  marketId: string,
  side: "long" | "short" | "buy" | "sell",
  size: number,
  price: number
): Promise<{ success: boolean; txId: string }> {
  await delay(1000);
  
  return {
    success: true,
    txId: `0x${Math.random().toString(16).slice(2)}`,
  };
}

export async function deployMarket(marketData: any): Promise<{ success: boolean; marketId: string; txId: string }> {
  await delay(2500);
  
  return {
    success: true,
    marketId: `market-${marketData.basics.symbol.toLowerCase()}-${Date.now()}`,
    txId: `0x${Math.random().toString(16).slice(2)}`,
  };
}

let realtimeUpdateInterval: NodeJS.Timeout | null = null;

export function startRealtimeUpdates(
  onPriceUpdate: (marketId: string, price: number) => void,
  onTradeUpdate: (trade: Trade) => void
) {
  if (realtimeUpdateInterval) return;

  realtimeUpdateInterval = setInterval(() => {
    const markets = marketsData as Market[];
    const randomMarket = markets[Math.floor(Math.random() * markets.length)];
    
    const priceChange = (Math.random() - 0.5) * 0.0002;
    const newPrice = randomMarket.metrics.currentPrice * (1 + priceChange);
    
    onPriceUpdate(randomMarket.id, newPrice);
    
    if (Math.random() > 0.7) {
      const trade: Trade = {
        id: `trade-${randomMarket.id}-${Date.now()}`,
        marketId: randomMarket.id,
        symbol: randomMarket.symbol,
        timestamp: Date.now(),
        price: newPrice,
        size: 100 + Math.random() * 500,
        side: Math.random() > 0.5 ? "buy" : "sell",
      };
      onTradeUpdate(trade);
    }
  }, 3000);
}

export function stopRealtimeUpdates() {
  if (realtimeUpdateInterval) {
    clearInterval(realtimeUpdateInterval);
    realtimeUpdateInterval = null;
  }
}
