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

  // Withdraw SOL from custodial wallet
  app.post("/api/wallet/withdraw", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  const httpServer = createServer(app);
  return httpServer;
}
