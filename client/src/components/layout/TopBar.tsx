import { Search, Bell, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function TopBar() {
  const [searchFocused, setSearchFocused] = useState(false);

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

  return (
    <header className="h-16 bg-card/95 backdrop-blur-sm border-b border-card-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: Sidebar Trigger + Search */}
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="global-search"
              type="search"
              placeholder="Search markets..."
              className="pl-10 pr-20 bg-background/50 border-border h-9"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              data-testid="input-search"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-muted-foreground bg-muted/30 border border-border rounded">
              {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"} K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Network Indicator */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-md"
          data-testid="badge-network"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary">Solana Mainnet</span>
        </motion.div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
          <Bell className="w-4 h-4" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
            3
          </Badge>
        </Button>

        {/* Wallet Connect */}
        <Button
          variant="default"
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          data-testid="button-wallet-connect"
        >
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">Connect Wallet</span>
        </Button>
      </div>
    </header>
  );
}
