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
  
  // Multi-wallet operations
  getAllUserWallets(userId: string): Promise<Wallet[]>;
  createAdditionalWallet(wallet: InsertWallet): Promise<Wallet>;
  getWalletById(walletId: string): Promise<Wallet | undefined>;
  updateWallet(walletId: string, updates: { name?: string; isArchived?: string }): Promise<Wallet>;
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

  // Multi-wallet operations
  async getAllUserWallets(userId: string): Promise<Wallet[]> {
    return await db.select().from(wallets).where(eq(wallets.userId, userId));
  }

  async createAdditionalWallet(wallet: InsertWallet): Promise<Wallet> {
    const [newWallet] = await db
      .insert(wallets)
      .values(wallet)
      .returning();
    
    return newWallet;
  }

  async getWalletById(walletId: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, walletId));
    return wallet;
  }

  async updateWallet(walletId: string, updates: { name?: string; isArchived?: string }): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(wallets.id, walletId))
      .returning();
    
    return wallet;
  }
}

// Development mode detection
const isDevelopment = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost');

// Development storage implementation
class DevelopmentStorage implements IStorage {
  private mockUsers = new Map<string, User>();
  private mockWallets = new Map<string, Wallet>();
  private nextWalletId = 1;

  async getUser(id: string): Promise<User | undefined> {
    // Return mock user if exists, otherwise create one
    if (!this.mockUsers.has(id)) {
      const mockUser: User = {
        id,
        email: "dev@example.com",
        firstName: "Dev",
        lastName: "User",
        profileImageUrl: "https://via.placeholder.com/150",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.mockUsers.set(id, mockUser);
    }
    return this.mockUsers.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockUsers.set(userData.id, user);
    return user;
  }

  async getUserWallet(userId: string): Promise<Wallet | undefined> {
    return this.mockWallets.get(userId);
  }

  async createWallet(userId: string): Promise<Wallet> {
    const { publicKey, encryptedPrivateKey } = WalletService.createWallet();
    
    const wallet: Wallet = {
      id: `wallet-${this.nextWalletId++}`,
      userId,
      publicKey,
      encryptedPrivateKey,
      balance: "0",
      name: "Main Wallet",
      isArchived: "false",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.mockWallets.set(userId, wallet);
    return wallet;
  }

  async updateWalletBalance(walletId: string, balance: string): Promise<Wallet> {
    const wallet = Array.from(this.mockWallets.values()).find(w => w.id === walletId);
    if (wallet) {
      wallet.balance = balance;
      wallet.updatedAt = new Date();
    }
    return wallet!;
  }

  async getAllUserWallets(userId: string): Promise<Wallet[]> {
    return Array.from(this.mockWallets.values()).filter(w => w.userId === userId);
  }

  async createAdditionalWallet(wallet: InsertWallet): Promise<Wallet> {
    const newWallet: Wallet = {
      id: `wallet-${this.nextWalletId++}`,
      ...wallet,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockWallets.set(newWallet.id, newWallet);
    return newWallet;
  }

  async getWalletById(walletId: string): Promise<Wallet | undefined> {
    return Array.from(this.mockWallets.values()).find(w => w.id === walletId);
  }

  async updateWallet(walletId: string, updates: { name?: string; isArchived?: string }): Promise<Wallet> {
    const wallet = Array.from(this.mockWallets.values()).find(w => w.id === walletId);
    if (wallet) {
      Object.assign(wallet, updates);
      wallet.updatedAt = new Date();
    }
    return wallet!;
  }
}

export const storage = isDevelopment ? new DevelopmentStorage() : new DatabaseStorage();
