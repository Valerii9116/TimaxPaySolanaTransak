import React, { useMemo } from 'react';

// --- WALLET & PROVIDER IMPORTS ---
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { EVM_CHAINS_WAGMI } from './config.js';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletError } from '@solana/wallet-adapter-base';

// Create a single instance of QueryClient
const queryClient = new QueryClient();

/**
 * This component encapsulates all the wallet provider logic.
 * It initializes both EVM (via Web3Modal/Wagmi) and Solana providers.
 * By wrapping the main App component, it ensures that all wallet
 * functionalities are ready before the app tries to use them.
 */
function WalletAdapters({ serverConfig, children }) {
  // --- Solana Configuration ---
  const solanaEndpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
  
  // Adding UnsafeBurnerWalletAdapter is great for testing without a real wallet.
  const solanaWallets = useMemo(
    () => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new UnsafeBurnerWalletAdapter(), // For easy testing
    ],
    []
  );

  const handleWalletError = (error) => {
    console.error("Solana Wallet Adapter Error:", error);
    if (error instanceof WalletError) {
        console.error(`Detailed Wallet Error: ${error.message}`);
    }
  };

  // --- EVM (Wagmi/Web3Modal) Configuration ---
  const { wagmiConfig, web3Modal } = useMemo(() => {
    const projectId = serverConfig.walletConnectProjectId;
    const metadata = {
        name: 'TimaxPay Terminal',
        description: 'TimaxPay Crypto Terminal',
        url: 'https://merch.timaxpay.com',
        icons: ['https://merch.timaxpay.com/logo512.png']
    };

    const config = defaultWagmiConfig({
        chains: EVM_CHAINS_WAGMI,
        projectId,
        metadata,
        enableCoinbase: false, // Disabling specific wallets can sometimes improve stability
    });

    createWeb3Modal({
        wagmiConfig: config,
        projectId,
        enableAnalytics: false,
        themeMode: 'dark',
        enableOnramp: true
    });
    
    return { wagmiConfig: config, web3Modal: true };
  }, [serverConfig.walletConnectProjectId]);

  // The nested structure of providers is critical for them to work together.
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={solanaEndpoint}>
          <WalletProvider wallets={solanaWallets} onError={handleWalletError} autoConnect={false}>
            <WalletModalProvider>
              {children}
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default WalletAdapters;
