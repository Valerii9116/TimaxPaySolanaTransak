import React, { useMemo, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConfig } from './ConfigProvider';
import { EVM_CHAINS } from '../config';

// Create a single QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 1000,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const createWagmiConfig = (projectId) => createConfig({
  chains: [...EVM_CHAINS],
  projectId,
  transports: EVM_CHAINS.reduce((acc, chain) => ({ ...acc, [chain.id]: http() }), {}),
  connectors: [
    walletConnect({ 
      projectId,
      metadata: {
        name: 'TimaxPay Terminal',
        description: 'Accept fiat, receive crypto',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:5173',
        icons: ['https://walletconnect.com/walletconnect-logo.png']
      }
    }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({ 
      appName: 'TimaxPay Terminal',
      darkMode: true 
    })
  ],
  ssr: false,
});

export const WalletProviders = ({ children }) => {
  const { walletConnectProjectId } = useConfig();
  const [isInitialized, setIsInitialized] = useState(false);
  const isModalCreated = useRef(false);

  // Memoize the wagmiConfig to prevent unnecessary re-creations
  const wagmiConfig = useMemo(() => {
    if (!walletConnectProjectId) return null;
    return createWagmiConfig(walletConnectProjectId);
  }, [walletConnectProjectId]);

  // Create the Web3Modal instance only once
  useEffect(() => {
    if (wagmiConfig && walletConnectProjectId && !isModalCreated.current) {
      try {
        createWeb3Modal({
          wagmiConfig,
          projectId: walletConnectProjectId,
          enableAnalytics: false, // Disabled to avoid tracking issues
          themeMode: 'dark',
          themeVariables: {
            '--w3m-color-mix': '#1e1e1e',
            '--w3m-accent': '#3498db',
          }
        });
        isModalCreated.current = true;
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to create Web3Modal:', error);
        setIsInitialized(true); // Still proceed even if modal creation fails
      }
    }
  }, [wagmiConfig, walletConnectProjectId]);

  const solanaNetwork = 'mainnet-beta';
  
  // Use a reliable RPC endpoint
  const endpoint = useMemo(() => {
    return process.env.REACT_APP_SOLANA_RPC_URL || clusterApiUrl(solanaNetwork);
  }, [solanaNetwork]);

  // IMPORTANT: Empty wallets array to rely on Standard Wallet detection
  // Modern wallets like Phantom and Solflare auto-register via Wallet Standard
  const wallets = useMemo(() => {
    return []; // Let Standard Wallets handle everything
  }, []);

  // Improved error handling
  const onError = (error) => {
    console.error('Solana wallet error:', error);
    
    // Handle specific error types gracefully
    if (error?.message?.includes('User rejected')) {
      console.log('User rejected wallet connection');
      return;
    }
    if (error?.message?.includes('Wallet not found')) {
      console.log('Wallet extension not found');
      return;
    }
    if (error?.message?.includes('Failed to connect')) {
      console.log('Failed to connect to wallet');
      return;
    }
    
    // Don't throw for other errors, just log them
    console.error('Wallet error details:', error);
  };

  // Wait for initialization
  if (!isInitialized) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Initializing Wallets...</p>
        </div>
      </div>
    );
  }

  if (!wagmiConfig) {
    return (
      <div className="app-container">
        <div className="error-message main-status">
          Failed to initialize wallet configuration. Please check your settings.
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider
          endpoint={endpoint}
          config={{ 
            commitment: 'confirmed',
            preflightCommitment: 'processed',
            wsEndpoint: undefined // Disable WebSocket to avoid connection issues
          }}
        >
          <WalletProvider
            wallets={wallets}
            onError={onError}
            autoConnect={false}
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