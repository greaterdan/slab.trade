import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  Settings, 
  Twitter, 
  Compass, 
  Activity, 
  BarChart3,
  Palette,
  MessageCircle,
  FileText,
  Bell
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  icon: string;
}

interface WalletInfo {
  id: string;
  name: string;
  balance: number;
  publicKey: string;
}

interface PnLData {
  totalPnL: number;
  dayPnL: number;
  positions: Array<{
    symbol: string;
    pnl: number;
    size: number;
  }>;
}

export function BottomNav() {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([
    { symbol: "BTC", price: 108100, change24h: 2.34, icon: "/crypto-logos/bitcoin.png" },
    { symbol: "ETH", price: 3846, change24h: -1.23, icon: "/crypto-logos/etherium.png" },
    { symbol: "SOL", price: 186.09, change24h: 5.67, icon: "/crypto-logos/solana.png" }
  ]);

  const [wallets, setWallets] = useState<WalletInfo[]>([
    { id: "1", name: "Main Wallet", balance: 2.5, publicKey: "HLLk...RTsQ" },
    { id: "2", name: "Trading Wallet", balance: 0.8, publicKey: "3pLm...2xTa" }
  ]);

  const [selectedWallet, setSelectedWallet] = useState<string>("1");
  const [showPnL, setShowPnL] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [showWalletTracker, setShowWalletTracker] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("stable");

  const [pnlData, setPnlData] = useState<PnLData>({
    totalPnL: 1250.50,
    dayPnL: 340.25,
    positions: [
      { symbol: "BONK", pnl: 450.75, size: 1000000 },
      { symbol: "WIF", pnl: -120.30, size: 500 },
      { symbol: "MYRO", pnl: 920.05, size: 2500 }
    ]
  });

  const [walletTrackerData, setWalletTrackerData] = useState([
    {
      id: "1",
      address: "0x742d...8f3a",
      name: "Whale Tracker",
      recentTrades: [
        { token: "ETH", action: "Bought", amount: "50.2", price: "$3,846", time: "2m ago" },
        { token: "SOL", action: "Sold", amount: "1,200", price: "$186.09", time: "5m ago" }
      ],
      totalValue: "$2.4M",
      pnl: "+12.5%"
    },
    {
      id: "2", 
      address: "0x9f1a...7b2c",
      name: "DeFi Master",
      recentTrades: [
        { token: "BTC", action: "Bought", amount: "2.1", price: "$108,100", time: "1m ago" },
        { token: "ETH", action: "Bought", amount: "25.0", price: "$3,846", time: "3m ago" }
      ],
      totalValue: "$1.8M",
      pnl: "+8.2%"
    },
    {
      id: "3",
      address: "0x3c5e...9d1f", 
      name: "NFT Collector",
      recentTrades: [
        { token: "SOL", action: "Bought", amount: "500", price: "$186.09", time: "4m ago" },
        { token: "ETH", action: "Sold", amount: "15.0", price: "$3,846", time: "7m ago" }
      ],
      totalValue: "$950K",
      pnl: "-2.1%"
    }
  ]);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}K`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-400" : "text-red-400";
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-between px-4 py-1 h-12">
          {/* Left Section - Navigation */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-4 h-4" />
              <span className="text-xs">Settings</span>
            </button>
            
            <button 
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowWalletTracker(!showWalletTracker)}
            >
              <Wallet className="w-4 h-4" />
              <span className="text-xs">Wallet</span>
            </button>
            
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-xs">X</span>
            </button>
            
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Compass className="w-4 h-4" />
              <span className="text-xs">Discover</span>
            </button>
            
            <button 
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPnL(!showPnL)}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">PnL</span>
            </button>
          </div>

          {/* Center Section - Crypto Prices */}
          <div className="flex items-center gap-6">
            {cryptoPrices.map((crypto) => (
              <div key={crypto.symbol} className="flex items-center gap-2">
                {crypto.icon.startsWith('/') || crypto.icon.startsWith('http') ? (
                  <img 
                    src={crypto.icon} 
                    alt={crypto.symbol} 
                    className={`object-contain ${crypto.symbol === 'SOL' ? 'w-8 h-8' : 'w-6 h-6'}`}
                    onError={(e) => {
                      // Fallback to symbol if image fails to load
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`text-lg ${crypto.icon.startsWith('/') || crypto.icon.startsWith('http') ? 'hidden' : ''}`}>
                  {crypto.icon}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-mono">{formatPrice(crypto.price)}</span>
                  <span className={`text-xs ${getChangeColor(crypto.change24h)}`}>
                    {formatChange(crypto.change24h)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Section - Utilities */}
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="w-4 h-4" />
            </button>
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <FileText className="w-4 h-4" />
            </button>
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PnL Popup Card */}
      <AnimatePresence>
        {showPnL && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="p-4 w-80 bg-card border shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Portfolio PnL</h3>
                  <button 
                    onClick={() => setShowPnL(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total PnL</p>
                    <p className={`text-lg font-mono ${pnlData.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnlData.totalPnL >= 0 ? '+' : ''}${pnlData.totalPnL.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">24h PnL</p>
                    <p className={`text-lg font-mono ${pnlData.dayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnlData.dayPnL >= 0 ? '+' : ''}${pnlData.dayPnL.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Positions</p>
                  {pnlData.positions.map((position, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{position.symbol}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {position.size.toLocaleString()}
                        </span>
                        <span className={`font-mono ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Selector Popup */}
      <AnimatePresence>
        {showWalletSelector && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-4 z-50"
          >
            <Card className="p-3 w-64 bg-card border shadow-lg">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Select Wallet</h3>
                {wallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => {
                      setSelectedWallet(wallet.id);
                      setShowWalletSelector(false);
                    }}
                    className={`w-full text-left p-2 rounded transition-colors ${
                      selectedWallet === wallet.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{wallet.name}</p>
                        <p className="text-xs text-muted-foreground">{wallet.publicKey}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono">{wallet.balance} SOL</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Tracker Sidebar */}
      <AnimatePresence>
        {showWalletTracker && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-1/4 bg-card border-r border-border z-50 overflow-y-auto"
          >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Wallet Tracker</h2>
                  <button 
                    onClick={() => setShowWalletTracker(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>

                {/* Navigation Bar */}
                <div className="flex items-center gap-4 mb-6 p-2 bg-muted/50 rounded-lg">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                    <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                      <div className="w-2 h-2 bg-black rounded-sm"></div>
                    </div>
                    All
                  </button>
                  
                  <span className="text-sm text-muted-foreground">Manager</span>
                  
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-muted text-foreground rounded-md text-sm font-medium relative">
                    Trades
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full"></div>
                  </button>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground relative">
                    <span>Monitor</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                      <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                      <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-auto">
                    <button className="p-1 text-muted-foreground hover:text-foreground">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-muted-foreground hover:text-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {walletTrackerData.map((wallet) => (
                    <Card key={wallet.id} className="p-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{wallet.name}</p>
                            <p className="text-xs text-muted-foreground">{wallet.address}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono">{wallet.totalValue}</p>
                            <p className={`text-xs ${wallet.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                              {wallet.pnl}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Recent Trades</p>
                          {wallet.recentTrades.map((trade, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-xs ${
                                  trade.action === 'Bought' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {trade.action}
                                </span>
                                <span className="font-medium">{trade.token}</span>
                              </div>
                              <div className="text-right">
                                <p className="font-mono">{trade.amount}</p>
                                <p className="text-muted-foreground">{trade.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
