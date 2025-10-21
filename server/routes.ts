import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { WalletService } from "./walletService";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Solana connection (devnet for now)
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Auth routes - Return null if not authenticated (don't use isAuthenticated middleware)
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      // If not authenticated, return null (not 401)
      if (!req.isAuthenticated()) {
        return res.json(null);
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get or create user's wallet
      let wallet = await storage.getUserWallet(userId);
      if (!wallet) {
        wallet = await storage.createWallet(userId);
      }
      
      // Return user with wallet info (but not private key)
      res.json({
        ...user,
        wallet: {
          publicKey: wallet.publicKey,
          balance: wallet.balance,
        },
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get wallet balance from blockchain
  app.get("/api/wallet/balance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallet = await storage.getUserWallet(userId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      // Fetch balance from Solana blockchain
      const publicKey = new PublicKey(wallet.publicKey);
      const balance = await connection.getBalance(publicKey);
      const balanceInSol = balance / LAMPORTS_PER_SOL;
      
      // Update stored balance
      await storage.updateWalletBalance(wallet.id, balanceInSol.toString());
      
      res.json({ balance: balanceInSol });
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  // Export private key (IMPORTANT: User must be authenticated)
  app.get("/api/wallet/export-key", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallet = await storage.getUserWallet(userId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      // Decrypt and return private key in base58 format
      const privateKey = WalletService.exportPrivateKey(wallet.encryptedPrivateKey);
      
      res.json({ privateKey });
    } catch (error) {
      console.error("Error exporting private key:", error);
      res.status(500).json({ message: "Failed to export private key" });
    }
  });

  // Create wallet (in case user wants to regenerate)
  app.post("/api/wallet/create", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if wallet already exists
      const existingWallet = await storage.getUserWallet(userId);
      if (existingWallet) {
        return res.status(400).json({ message: "Wallet already exists" });
      }
      
      // Create new wallet
      const wallet = await storage.createWallet(userId);
      
      res.json({
        publicKey: wallet.publicKey,
        balance: wallet.balance,
      });
    } catch (error) {
      console.error("Error creating wallet:", error);
      res.status(500).json({ message: "Failed to create wallet" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
