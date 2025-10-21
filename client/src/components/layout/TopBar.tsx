import { Search, Bell, Wallet, Home, Rocket, Compass, TrendingUp, User, FileText, Menu, LogOut, Key, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Rocket, label: "Launch", path: "/launch" },
  { icon: Compass, label: "Discover", path: "/discover" },
  { icon: TrendingUp, label: "Markets", path: "/markets" },
  { icon: User, label: "Creator", path: "/creator" },
  { icon: FileText, label: "Docs", path: "/docs" },
];

export function TopBar() {
  const { toast } = useToast();
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Export private key mutation
  const exportKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/wallet/export-key", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to export private key");
      return res.json();
    },
    onSuccess: (data: { privateKey: string }) => {
      navigator.clipboard.writeText(data.privateKey);
      toast({
        title: "Private Key Copied",
        description: "Your private key has been copied to clipboard. Keep it safe!",
        variant: "destructive",
        duration: 5000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export private key",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const copyAddress = () => {
    if (user?.wallet?.publicKey) {
      navigator.clipboard.writeText(user.wallet.publicKey);
      toast({
        title: "Copied",
        description: "Wallet address copied to clipboard",
        duration: 2000,
      });
    }
  };

  const exportPrivateKey = () => {
    exportKeyMutation.mutate();
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <header className="h-14 bg-background border-b border-primary/20 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: Logo + Desktop Navigation */}
      <div className="flex items-center gap-6">
        <div 
          className="w-10 h-10 rounded-none bg-gradient-to-br from-solana-mint via-solana-aqua to-solana-purple flex items-center justify-center cursor-pointer flex-shrink-0 border border-primary/30"
          onClick={() => navigate("/")}
          data-testid="logo-home"
        >
          <span className="text-sm font-bold text-black">SL</span>
        </div>
        
        {/* Desktop Horizontal Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className={`gap-2 border ${isActive ? 'border-primary/50 bg-primary/10 text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-primary/20'}`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs">[{item.label.toUpperCase()}]</span>
              </Button>
            );
          })}
        </nav>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden border border-primary/20" data-testid="button-mobile-menu">
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-background border-r border-primary/20">
            <nav className="flex flex-col gap-2 mt-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;

                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigation(item.path)}
                    className={`justify-start gap-3 border ${isActive ? 'border-primary/50 bg-primary/10 text-primary' : 'border-transparent text-muted-foreground'}`}
                    data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{item.label.toUpperCase()}</span>
                  </Button>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/50" />
          <Input
            id="global-search"
            type="search"
            placeholder="$ SEARCH MARKETS..."
            className="pl-10 pr-16 bg-background/50 border-primary/20 h-9 text-xs placeholder:text-muted-foreground focus:border-primary/40"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            data-testid="input-search"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] text-primary/70 bg-background border border-primary/20">
            ^K
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Network Indicator */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-transparent border border-primary/30 text-xs"
          data-testid="badge-network"
        >
          <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
          <span className="text-primary font-mono">SOLANA</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative border border-transparent hover:border-primary/20" data-testid="button-notifications">
          <Bell className="w-4 h-4" />
          <Badge className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center p-0 bg-transparent border border-destructive text-destructive text-[10px]">
            3
          </Badge>
        </Button>

        {/* Login / Wallet Display */}
        {!isAuthenticated ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">LOGIN</span>
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                data-testid="button-wallet-menu"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs font-mono">
                  {user?.wallet?.publicKey ? truncateAddress(user.wallet.publicKey) : "WALLET"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-background border-primary/20">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                YOUR WALLET
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-primary/20" />
              
              {/* Wallet Address */}
              <div className="px-2 py-2 space-y-1">
                <div className="text-xs text-muted-foreground">Address</div>
                <div className="text-xs font-mono text-primary" data-testid="text-wallet-address">
                  {user?.wallet?.publicKey || "Loading..."}
                </div>
              </div>

              {/* Balance */}
              <div className="px-2 py-2 space-y-1">
                <div className="text-xs text-muted-foreground">Balance</div>
                <div className="text-xs font-mono text-primary" data-testid="text-wallet-balance">
                  {user?.wallet?.balance || "0"} SOL
                </div>
              </div>
              
              <DropdownMenuSeparator className="bg-primary/20" />
              
              <DropdownMenuItem onClick={copyAddress} className="text-xs hover:bg-primary/10" data-testid="menu-copy-address">
                <Copy className="w-3.5 h-3.5 mr-2" />
                Copy Address
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={exportPrivateKey} className="text-xs hover:bg-primary/10" data-testid="menu-export-key">
                <Key className="w-3.5 h-3.5 mr-2" />
                Export Private Key
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-primary/20" />
              
              <DropdownMenuItem
                onClick={() => window.location.href = "/api/logout"}
                className="text-xs text-destructive hover:bg-destructive/10"
                data-testid="menu-logout"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
