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
  const [pnlPosition, setPnlPosition] = useState({ x: 0, y: 0 });
  const [pnlSize, setPnlSize] = useState({ width: 320, height: 200 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<"all" | "manager" | "trades">("all");
  const [newWalletAddress, setNewWalletAddress] = useState("");

  // Add body class when wallet tracker is open
  useEffect(() => {
    if (showWalletTracker) {
      document.body.classList.add('wallet-tracker-open');
    } else {
      document.body.classList.remove('wallet-tracker-open');
    }
    
    return () => {
      document.body.classList.remove('wallet-tracker-open');
    };
  }, [showWalletTracker]);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: pnlSize.width,
      height: pnlSize.height
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPnlPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(250, Math.min(600, resizeStart.width + deltaX));
      const newHeight = Math.max(200, Math.min(500, resizeStart.height + deltaY));
      setPnlSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, pnlPosition]);

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
              <Compass className="w-4 h-4" />
              <span className="text-xs">Discover</span>
            </button>
            
            <button 
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => {
                setShowPnL(!showPnL);
                if (!showPnL) {
                  // Reset to original size when opening
                  setPnlSize({ width: 320, height: 200 });
                }
              }}
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
                  <span className="text-sm font-mono text-foreground">{formatPrice(crypto.price)}</span>
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
              <FileText className="w-4 h-4" />
            </button>
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <button 
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => window.open('https://x.com/slabtrade', '_blank')}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* PnL Popup Card */}
      <AnimatePresence>
        {showPnL && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 cursor-move"
            style={{
              left: pnlPosition.x || window.innerWidth / 2 - 160,
              top: pnlPosition.y || window.innerHeight / 2 - 150,
              width: pnlSize.width,
              height: pnlSize.height,
              transform: isDragging ? 'scale(1.05)' : 'scale(1)',
              transition: isDragging ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={handleMouseDown}
          >
            <Card className="p-4 h-full bg-amber-900/90 border border-amber-700/50 shadow-2xl backdrop-blur-sm relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-amber-100">Portfolio PnL</h3>
                  <button 
                    onClick={() => setShowPnL(false)}
                    className="text-amber-300 hover:text-amber-100 transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-amber-200/70">Total PnL</p>
                    <p className={`text-lg font-mono ${pnlData.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnlData.totalPnL >= 0 ? '+' : ''}${pnlData.totalPnL.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-200/70">24h PnL</p>
                    <p className={`text-lg font-mono ${pnlData.dayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnlData.dayPnL >= 0 ? '+' : ''}${pnlData.dayPnL.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-amber-200/70">Positions</p>
                  {pnlData.positions.map((position, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-amber-100">{position.symbol}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-200/70">
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
              
              {/* Resize Handle */}
              <div
                className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
                onMouseDown={handleResizeMouseDown}
                style={{
                  background: 'linear-gradient(-45deg, transparent 30%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.5) 70%, transparent 70%)'
                }}
              />
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
                <h3 className="font-semibold text-sm text-foreground">Select Wallet</h3>
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
                        <p className="text-sm font-medium text-foreground">{wallet.name}</p>
                        <p className="text-xs text-muted-foreground">{wallet.publicKey}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-foreground">{wallet.balance} SOL</p>
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
              className="fixed left-0 top-16 bottom-16 w-1/4 bg-card/95 backdrop-blur-sm border-r border-border/50 shadow-2xl z-30 overflow-hidden rounded-r-lg"
            >
              {/* Navigation Bar - Top */}
              <div className="sticky top-0 bg-card/80 backdrop-blur-sm border-b border-border/30 p-4 z-10 rounded-tr-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveTab("all")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === "all" 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "bg-muted/50 text-foreground hover:bg-muted/70"
                      }`}
                    >
                      <div className="w-3 h-3 bg-white rounded-sm flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-black rounded-sm"></div>
                      </div>
                      All
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("manager")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === "manager" 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "bg-muted/50 text-foreground hover:bg-muted/70"
                      }`}
                    >
                      Manager
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("trades")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                        activeTab === "trades" 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "bg-muted/50 text-foreground hover:bg-muted/70"
                      }`}
                    >
                      Trades
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full"></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setShowWalletTracker(false)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 h-full overflow-y-auto bg-gradient-to-b from-transparent to-card/20">
                {activeTab === "all" && (
                  <div className="space-y-1.5">
                    {walletTrackerData.map((wallet) => (
                      <Card key={wallet.id} className="p-2 bg-card/50 border-border/30 shadow-sm hover:shadow-md transition-shadow">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-xs text-foreground">{wallet.name}</p>
                              <p className="text-[10px] text-muted-foreground">{wallet.address}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-mono text-foreground">{wallet.totalValue}</p>
                              <p className={`text-[10px] ${wallet.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                {wallet.pnl}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">Recent Trades</p>
                            {wallet.recentTrades.map((trade, index) => (
                              <div key={index} className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center gap-1">
                                  <span className={`px-1 py-0.5 rounded text-[9px] ${
                                    trade.action === 'Bought' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {trade.action}
                                  </span>
                                  <span className="font-medium">{trade.token}</span>
                                </div>
                                <div className="text-right">
                                  <p className="font-mono text-[9px]">{trade.amount}</p>
                                  <p className="text-muted-foreground text-[9px]">{trade.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {activeTab === "manager" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/10 border border-border/20 rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium mb-2">Add New Wallet</h3>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Enter wallet address..."
                          value={newWalletAddress}
                          onChange={(e) => setNewWalletAddress(e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-background border border-border rounded"
                        />
                        <button 
                          onClick={() => {
                            if (newWalletAddress.trim()) {
                              // Add wallet logic here
                              setNewWalletAddress("");
                            }
                          }}
                          className="w-full px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90"
                        >
                          Add Wallet
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium">Tracked Wallets</h3>
                      {walletTrackerData.map((wallet) => (
                        <Card key={wallet.id} className="p-2 bg-card/50 border-border/30 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-xs text-foreground">{wallet.name}</p>
                              <p className="text-[10px] text-muted-foreground">{wallet.address}</p>
                            </div>
                            <button className="text-red-400 hover:text-red-300 text-xs">
                              Remove
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "trades" && (
                  <div className="space-y-1.5">
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">Live trades will appear here</p>
                      <p className="text-xs text-muted-foreground mt-1">Coming soon...</p>
                    </div>
                  </div>
                )}
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
