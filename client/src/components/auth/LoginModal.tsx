import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Wallet, 
  User, 
  Shield, 
  Zap, 
  ExternalLink,
  Chrome,
  Smartphone
} from "lucide-react";
import { WalletService } from "@/lib/wallet";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [walletAvailable, setWalletAvailable] = useState(false);

  // Check if wallet is available when modal opens
  useEffect(() => {
    if (isOpen) {
      setWalletAvailable(WalletService.isWalletAvailable());
    }
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    setIsConnecting("google");
    try {
      // For now, redirect to the existing OAuth flow
      // In production, this would be Google OAuth
      window.location.href = "/api/login";
    } catch (error) {
      console.error("Google login error:", error);
      setIsConnecting(null);
    }
  };

  const handleSolanaWallet = async () => {
    setIsConnecting("solana");
    try {
      // Check if wallet is available
      if (!WalletService.isWalletAvailable()) {
        alert("Please install Phantom wallet or another Solana wallet to continue.");
        setIsConnecting(null);
        return;
      }

      // Connect to wallet
      const result = await WalletService.connectWallet();
      if (result) {
        console.log(`Connected to ${result.walletType} wallet:`, result.publicKey);
        
        // Here you would typically:
        // 1. Send the public key to your backend
        // 2. Create a user session
        // 3. Redirect to the app
        
        // For now, we'll redirect to the existing flow
        // In production, you'd send the wallet info to your backend
        window.location.href = "/api/login";
      } else {
        alert("Failed to connect wallet. Please try again.");
        setIsConnecting(null);
      }
    } catch (error) {
      console.error("Solana wallet connection error:", error);
      alert("Failed to connect wallet. Please try again.");
      setIsConnecting(null);
    }
  };

  const handleEmailLogin = () => {
    setIsConnecting("email");
    // For development, redirect to existing flow
    // In production, this would be email/password or magic link
    window.location.href = "/api/login";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-center text-xl font-mono">
            Welcome to SLAB
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Choose your login method
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Google Login */}
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={handleGoogleLogin}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <Chrome className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Google</CardTitle>
                  <CardDescription className="text-xs">Sign in with your Google account</CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  Popular
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full" 
                disabled={isConnecting === "google"}
                onClick={handleGoogleLogin}
              >
                {isConnecting === "google" ? (
                  <>
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mail className="w-3 h-3 mr-2" />
                    Continue with Google
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Solana Wallet */}
          <Card className={`hover:bg-accent/50 transition-colors cursor-pointer ${!walletAvailable ? 'opacity-50' : ''}`} onClick={walletAvailable ? handleSolanaWallet : undefined}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Wallet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Solana Wallet</CardTitle>
                  <CardDescription className="text-xs">
                    {walletAvailable 
                      ? "Connect your Phantom, Solflare, or other Solana wallet"
                      : "Install Phantom wallet or another Solana wallet to continue"
                    }
                  </CardDescription>
                </div>
                <Badge variant={walletAvailable ? "secondary" : "destructive"} className="text-xs px-1.5 py-0.5">
                  {walletAvailable ? "Web3" : "Not Available"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full" 
                disabled={isConnecting === "solana" || !walletAvailable}
                onClick={handleSolanaWallet}
              >
                {isConnecting === "solana" ? (
                  <>
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Connecting...
                  </>
                ) : walletAvailable ? (
                  <>
                    <Zap className="w-3 h-3 mr-2" />
                    Connect Wallet
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Install Wallet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Email Login */}
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={handleEmailLogin}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Email</CardTitle>
                  <CardDescription className="text-xs">Sign in with email and password</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  Traditional
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full" 
                disabled={isConnecting === "email"}
                onClick={handleEmailLogin}
              >
                {isConnecting === "email" ? (
                  <>
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Shield className="w-3 h-3 mr-2" />
                    Continue with Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-3 border-t">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
