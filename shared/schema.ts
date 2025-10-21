import { z } from "zod";

export type MarketStatus = "bonding" | "warmup" | "perps";

export type BondingCurveType = "linear" | "exponential";

export interface Market {
  id: string;
  symbol: string;
  name: string;
  imageUrl?: string;
  status: MarketStatus;
  createdAt: number;
  creatorAddress: string;
  
  bondingConfig: {
    curveType: BondingCurveType;
    startPrice: number;
    creatorTax: number;
    protocolTax: number;
    seedVaultTax: number;
  };
  
  graduationTriggers: {
    minLiquidity: number;
    minHolders: number;
    minAgeHours: number;
  };
  
  perpsConfig: {
    tickSize: number;
    lotSize: number;
    maxLeverage: number;
    initialMargin: number;
    maintenanceMargin: number;
    priceBandBps: number;
    fundingK: number;
    warmupHours: number;
    warmupShortLevCap: number;
  };
  
  fees: {
    takerBps: number;
    makerBps: number;
    creatorFeePct: number;
    referrerFeePct: number;
  };
  
  metrics: {
    currentPrice: number;
    priceChange24h: number;
    volume24h: number;
    openInterest: number;
    liquidity: number;
    holders: number;
    ageHours: number;
    graduationProgress: number;
    fundingRate?: number;
  };
}

export interface Trade {
  id: string;
  marketId: string;
  symbol: string;
  timestamp: number;
  price: number;
  size: number;
  side: "buy" | "sell";
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  marketId: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdate: number;
}

export interface Position {
  id: string;
  marketId: string;
  symbol: string;
  side: "long" | "short";
  size: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  margin: number;
  pnl: number;
  pnlPct: number;
  liquidationPrice: number;
}

export interface LaunchFormData {
  step: number;
  
  basics: {
    name: string;
    symbol: string;
    imageUrl?: string;
  };
  
  bondingCurve: {
    curveType: BondingCurveType;
    startPrice: number;
    creatorTax: number;
    protocolTax: number;
    seedVaultTax: number;
  };
  
  graduationTriggers: {
    minLiquidity: number;
    minHolders: number;
    minAgeHours: number;
  };
  
  perpsParams: {
    tickSize: number;
    lotSize: number;
    maxLeverage: number;
    initialMargin: number;
    maintenanceMargin: number;
    priceBandBps: number;
    fundingK: number;
    warmupHours: number;
    warmupShortLevCap: number;
  };
  
  fees: {
    takerBps: number;
    makerBps: number;
    creatorFeePct: number;
    referrerFeePct: number;
  };
}

export interface CreatorStats {
  address: string;
  totalEarnings: number;
  totalVolume: number;
  marketsCreated: number;
  referralCode: string;
  referralEarnings: number;
  markets: Market[];
}

export const launchFormSchema = z.object({
  step: z.number().min(1).max(5),
  basics: z.object({
    name: z.string().min(1).max(50),
    symbol: z.string().min(1).max(10).toUpperCase(),
    imageUrl: z.string().optional(),
  }),
  bondingCurve: z.object({
    curveType: z.enum(["linear", "exponential"]),
    startPrice: z.number().positive(),
    creatorTax: z.number().min(0).max(100),
    protocolTax: z.number().min(0).max(100),
    seedVaultTax: z.number().min(0).max(100),
  }),
  graduationTriggers: z.object({
    minLiquidity: z.number().positive(),
    minHolders: z.number().int().positive(),
    minAgeHours: z.number().positive(),
  }),
  perpsParams: z.object({
    tickSize: z.number().positive(),
    lotSize: z.number().positive(),
    maxLeverage: z.number().min(1).max(100),
    initialMargin: z.number().min(0).max(100),
    maintenanceMargin: z.number().min(0).max(100),
    priceBandBps: z.number().positive(),
    fundingK: z.number(),
    warmupHours: z.number().positive(),
    warmupShortLevCap: z.number().min(1).max(10),
  }),
  fees: z.object({
    takerBps: z.number().min(0),
    makerBps: z.number(),
    creatorFeePct: z.number().min(0).max(100),
    referrerFeePct: z.number().min(0).max(100),
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
