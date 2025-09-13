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

// --- START OF DEFINITIVE FIX: This new architecture ensures stable initialization ---

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
  const isModalCreated = useRef(false);

  const wagmiConfig = useMemo(() => {
    if (!walletConnectProjectId) return null;
    return createWagmiConfig(walletConnectProjectId);
  }, [walletConnectProjectId]);

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
      // Once the modal is created, we can allow the rest of the app to render.
      setIsInitialized(true);
    }
  }, [wagmiConfig, walletConnectProjectId]);
  
  const solanaNetwork = 'mainnet-beta';
  const endpoint = useMemo(() => clusterApiUrl(solanaNetwork), []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolanaMobileWalletAdapter({
          appIdentity: { name: 'TimaxPay Terminal' },
          authorizationResultCache: createDefaultAuthorizationResultCache(),
          onWalletNotFound: createDefaultWalletNotFoundHandler(),
      }),
    ],
    []
  );

  // IMPORTANT: Render a loading state until all wallet providers are fully initialized.
  // This prevents child components from rendering too early and causing the crash.
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
  // --- END OF DEFINITIVE FIX ---

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect={false}>
            <WalletModalProvider>{children}</WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

WalletProviders.propTypes = {
    children: PropTypes.node.isRequired,
};

