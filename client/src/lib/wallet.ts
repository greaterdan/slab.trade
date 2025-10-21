// Solana wallet connection utilities
export interface WalletAdapter {
  publicKey: string;
  connected: boolean;
  connect: () => Promise<{ publicKey: string }>;
  disconnect: () => Promise<void>;
}

declare global {
  interface Window {
    solana?: WalletAdapter;
    phantom?: WalletAdapter;
  }
}

export class WalletService {
  static async connectWallet(): Promise<{ publicKey: string; walletType: string } | null> {
    try {
      // Check for Phantom wallet first
      if (window.phantom?.solana?.isPhantom) {
        const response = await window.phantom.solana.connect();
        return {
          publicKey: response.publicKey.toString(),
          walletType: 'phantom'
        };
      }
      
      // Check for generic Solana wallet
      if (window.solana?.isPhantom) {
        const response = await window.solana.connect();
        return {
          publicKey: response.publicKey.toString(),
          walletType: 'solana'
        };
      }
      
      // No wallet detected
      return null;
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  static async disconnectWallet(): Promise<void> {
    try {
      if (window.phantom?.solana?.disconnect) {
        await window.phantom.solana.disconnect();
      } else if (window.solana?.disconnect) {
        await window.solana.disconnect();
      }
    } catch (error) {
      console.error('Wallet disconnection error:', error);
    }
  }

  static isWalletAvailable(): boolean {
    return !!(window.phantom?.solana?.isPhantom || window.solana?.isPhantom);
  }

  static getWalletType(): string | null {
    if (window.phantom?.solana?.isPhantom) return 'phantom';
    if (window.solana?.isPhantom) return 'solana';
    return null;
  }
}
