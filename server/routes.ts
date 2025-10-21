import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { WalletService } from "./walletService";
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";

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

      // Handle both development and production user objects
      const userId = req.user.claims?.sub || req.user.id || req.user.claims?.sub;
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
      const userId = req.user.claims?.sub || req.user.id;
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
      const userId = req.user.claims?.sub || req.user.id;
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
      const userId = req.user.claims?.sub || req.user.id;
      
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

  // Withdraw SOL from custodial wallet
  app.post("/api/wallet/withdraw", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { recipientAddress, amount } = req.body;

      // Validate inputs
      if (!recipientAddress || !amount) {
        return res.status(400).json({ message: "Recipient address and amount are required" });
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Get user's wallet
      const wallet = await storage.getUserWallet(userId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      // Validate recipient address
      let recipientPubKey: PublicKey;
      try {
        recipientPubKey = new PublicKey(recipientAddress);
      } catch (error) {
        return res.status(400).json({ message: "Invalid recipient address" });
      }

      // Get keypair from encrypted private key
      const keypair = WalletService.getKeypair(wallet.encryptedPrivateKey);

      // Check balance
      const balance = await connection.getBalance(keypair.publicKey);
      const balanceInSol = balance / LAMPORTS_PER_SOL;

      // Estimate transaction fee (5000 lamports is typical for simple transfer)
      const estimatedFee = 5000 / LAMPORTS_PER_SOL;
      
      if (balanceInSol < amountNum + estimatedFee) {
        return res.status(400).json({ 
          message: "Insufficient balance",
          balance: balanceInSol,
          required: amountNum + estimatedFee
        });
      }

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: recipientPubKey,
          lamports: Math.floor(amountNum * LAMPORTS_PER_SOL),
        })
      );

      // Send transaction
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [keypair],
        { commitment: "confirmed" }
      );

      // Update balance in database
      const newBalance = await connection.getBalance(keypair.publicKey);
      const newBalanceInSol = newBalance / LAMPORTS_PER_SOL;
      await storage.updateWalletBalance(wallet.id, newBalanceInSol.toString());

      res.json({
        success: true,
        signature,
        newBalance: newBalanceInSol,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      });
    } catch (error) {
      console.error("Error withdrawing SOL:", error);
      res.status(500).json({ 
        message: "Failed to withdraw SOL",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ========== MULTI-WALLET MANAGEMENT ENDPOINTS ==========

  // List all wallets for authenticated user
  app.get("/api/wallets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const allWallets = await storage.getAllUserWallets(userId);
      
      // Don't expose encrypted private keys in list view
      const sanitizedWallets = allWallets.map((w: any) => ({
        id: w.id,
        name: w.name,
        publicKey: w.publicKey,
        balance: w.balance,
        isPrimary: w.isPrimary,
        isArchived: w.isArchived,
        createdAt: w.createdAt,
      }));

      res.json(sanitizedWallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });

  // Create additional wallet for authenticated user
  app.post("/api/wallets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { name } = req.body;

      if (!name || typeof name !== "string" || name.length === 0) {
        return res.status(400).json({ message: "Wallet name is required" });
      }

      // Create new wallet
      const { publicKey, encryptedPrivateKey } = WalletService.createWallet();

      const newWallet = await storage.createAdditionalWallet({
        userId,
        name,
        publicKey,
        encryptedPrivateKey,
        balance: "0",
        isPrimary: "false",
        isArchived: "false",
      });

      // Don't expose encrypted private key
      res.json({
        id: newWallet.id,
        name: newWallet.name,
        publicKey: newWallet.publicKey,
        balance: newWallet.balance,
        isPrimary: newWallet.isPrimary,
        isArchived: newWallet.isArchived,
      });
    } catch (error) {
      console.error("Error creating wallet:", error);
      res.status(500).json({ message: "Failed to create wallet" });
    }
  });

  // Update wallet (rename or archive)
  app.patch("/api/wallets/:walletId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { walletId } = req.params;
      const { name, isArchived } = req.body;

      const wallet = await storage.getWalletById(walletId);
      
      if (!wallet || wallet.userId !== userId) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      const updatedWallet = await storage.updateWallet(walletId, {
        name: name || wallet.name,
        isArchived: isArchived !== undefined ? isArchived : wallet.isArchived,
      });

      res.json({
        id: updatedWallet.id,
        name: updatedWallet.name,
        publicKey: updatedWallet.publicKey,
        balance: updatedWallet.balance,
        isPrimary: updatedWallet.isPrimary,
        isArchived: updatedWallet.isArchived,
      });
    } catch (error) {
      console.error("Error updating wallet:", error);
      res.status(500).json({ message: "Failed to update wallet" });
    }
  });

  // Refresh specific wallet balance from blockchain
  app.get("/api/wallets/:walletId/balance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { walletId } = req.params;

      const wallet = await storage.getWalletById(walletId);

      if (!wallet || wallet.userId !== userId) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      // Fetch balance from Solana blockchain
      const publicKey = new PublicKey(wallet.publicKey);
      const balance = await connection.getBalance(publicKey);
      const balanceInSol = balance / LAMPORTS_PER_SOL;

      // Update cached balance in database
      await storage.updateWalletBalance(wallet.id, balanceInSol.toString());

      res.json({ 
        balance: balanceInSol,
        publicKey: wallet.publicKey 
      });
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  // Export private key for a specific wallet
  app.get("/api/wallets/:walletId/export-key", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { walletId } = req.params;

      const wallet = await storage.getWalletById(walletId);

      if (!wallet || wallet.userId !== userId) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      const privateKey = WalletService.exportPrivateKey(wallet.encryptedPrivateKey);

      res.json({ privateKey });
    } catch (error) {
      console.error("Error exporting private key:", error);
      res.status(500).json({ message: "Failed to export private key" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
