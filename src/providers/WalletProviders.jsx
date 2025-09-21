import React, { useMemo, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { SolanaMobileWalletAdapter, createDefaultAuthorizationResultCache, createDefaultWalletNotFoundHandler } from '@solana-mobile/wallet-adapter-mobile';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConfig } from './ConfigProvider';
import { EVM_CHAINS } from '../config';

const queryClient = new QueryClient();

const createWagmiConfig = (projectId) => createConfig({
  chains: [...EVM_CHAINS],
  projectId,
  transports: EVM_CHAINS.reduce((acc, chain) => ({ ...acc, [chain.id]: http() }), {}),
  connectors: [
      walletConnect({ projectId }),
      injected({ shimDisconnect: true }),
      coinbaseWallet({ appName: 'TimaxPay Terminal', darkMode: true })
  ],
  ssr: false,
});

export const WalletProviders = ({ children }) => {
  const { walletConnectProjectId } = useConfig();
  const [isInitialized, setIsInitialized] = useState(false);
  const [solanaInitialized, setSolanaInitialized] = useState(false);
  const isModalCreated = useRef(false);

  // Memoize the wagmiConfig to prevent unnecessary re-creations
  const wagmiConfig = useMemo(() => {
    if (!walletConnectProjectId) return null;
    return createWagmiConfig(walletConnectProjectId);
  }, [walletConnectProjectId]);

  // Create the Web3Modal instance only once.
  useEffect(() => {
    if (wagmiConfig && !isModalCreated.current) {
      createWeb3Modal({
        wagmiConfig,
        projectId: walletConnectProjectId,
        enableAnalytics: true,
        themeMode: 'dark',
        themeVariables: {
          '--w3m-color-mix': '#1e1e1e',
          '--w3m-accent': '#3498db',
        }
      });
      isModalCreated.current = true;
      setIsInitialized(true);
    }
  }, [wagmiConfig, walletConnectProjectId]);
  
  const solanaNetwork = 'mainnet-beta';
  
  // Use a more reliable RPC endpoint
  const endpoint = useMemo(() => {
    // You might want to use a custom RPC endpoint instead of the default
    // For better reliability, consider using: 'https://api.mainnet-beta.solana.com'
    // or a premium RPC provider like QuickNode, Helius, etc.
    return process.env.REACT_APP_SOLANA_RPC_URL || clusterApiUrl(solanaNetwork);
  }, [solanaNetwork]);

  const wallets = useMemo(
    () => {
      const walletList = [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter({ network: solanaNetwork }),
      ];

      // Only add mobile adapter if we're in a mobile environment
      if (typeof window !== 'undefined' && 
          (window.navigator?.userAgent?.includes('Mobile') || 
           window.navigator?.userAgent?.includes('Android') || 
           window.navigator?.userAgent?.includes('iPhone'))) {
        walletList.push(
          new SolanaMobileWalletAdapter({
            appIdentity: { 
              name: 'TimaxPay Terminal',
              uri: window.location.origin,
              icon: `${window.location.origin}/favicon.ico`
            },
            authorizationResultCache: createDefaultAuthorizationResultCache(),
            onWalletNotFound: createDefaultWalletNotFoundHandler(),
          })
        );
      }

      return walletList;
    },
    [solanaNetwork]
  );

  // Handle Solana wallet errors
  const onError = (error) => {
    console.error('Solana wallet error:', error);
    
    // Handle specific error types
    if (error?.message?.includes('User rejected')) {
      console.log('User rejected wallet connection');
      return;
    }
    
    if (error?.message?.includes('Wallet not found')) {
      console.log('Wallet extension not found');
      return;
    }
    
    // Log other errors for debugging
    console.error('Unexpected wallet error:', error);
  };

  // Add a small delay to ensure Solana providers are ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setSolanaInitialized(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Wait for both EVM and Solana initialization
  if (!isInitialized || !solanaInitialized) {
    return (
        <div className="loading-container">
            <div className="loading-content">
                <div className="loading-spinner"></div>
                <p>Initializing Wallets...</p>
            </div>
        </div>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider 
          endpoint={endpoint}
          config={{ commitment: 'processed' }}
        >
          <WalletProvider 
            wallets={wallets} 
            onError={onError}
            autoConnect={false}
            localStorageKey="solana-wallet"
          >
            <WalletModalProvider>
              {children}
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

WalletProviders.propTypes = {
    children: PropTypes.node.isRequired,
};