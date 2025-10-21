import { users, wallets, type User, type UpsertUser, type Wallet, type InsertWallet } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { WalletService } from "./walletService";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Wallet operations
  getUserWallet(userId: string): Promise<Wallet | undefined>;
  createWallet(userId: string): Promise<Wallet>;
  updateWalletBalance(walletId: string, balance: string): Promise<Wallet>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Wallet operations
  async getUserWallet(userId: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }

  async createWallet(userId: string): Promise<Wallet> {
    const { publicKey, encryptedPrivateKey } = WalletService.createWallet();
    
    const [wallet] = await db
      .insert(wallets)
      .values({
        userId,
        publicKey,
        encryptedPrivateKey,
        balance: "0",
      })
      .returning();
    
    return wallet;
  }

  async updateWalletBalance(walletId: string, balance: string): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({ balance, updatedAt: new Date() })
      .where(eq(wallets.id, walletId))
      .returning();
    
    return wallet;
  }
}

export const storage = new DatabaseStorage();
