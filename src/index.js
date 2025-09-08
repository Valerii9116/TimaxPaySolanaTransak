import React, { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// --- WALLET & PROVIDER CONFIGURATION ---
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { EVM_CHAINS_WAGMI } from './config';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletError } from '@solana/wallet-adapter-base';

const queryClient = new QueryClient();

// A simple component to show while loading or on error
const StatusDisplay = ({ message }) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', padding: '2rem', color: 'white', textAlign: 'center' }}>
        {message}
    </div>
);

// This component wraps the main App and provides all the necessary context providers.
const AppWrapper = ({ config, children }) => {
  const solanaEndpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  // ** THE FIX IS HERE **
  // Add a robust error handler to the Solana WalletProvider to catch connection issues.
  const handleWalletError = (error) => {
    // You can use a toast library here to show a user-friendly message
    console.error("Solana Wallet Error:", error);
    if (error instanceof WalletError) {
        alert(`Wallet Error: ${error.message}`);
    } else {
        alert("An unknown wallet error occurred. Please try again.");
    }
  };

  return (
    <React.StrictMode>
      <WagmiProvider config={config.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ConnectionProvider endpoint={solanaEndpoint}>
            <WalletProvider 
              wallets={wallets} 
              onError={handleWalletError}
              // ** THE FIX IS HERE **
              // Disable autoConnect on mobile to ensure a more reliable manual connection flow.
              autoConnect={false} 
            >
              <WalletModalProvider>
                {children}
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </React.StrictMode>
  );
};

// Main initialization function to be called once.
const initializeApp = async () => {
    const container = document.getElementById('root');
    if (!container) return;
    const root = createRoot(container);

    // Render a loading state first
    root.render(<StatusDisplay message="Initializing Terminal..." />);

    try {
        const response = await fetch('/api/getConfig');
        if (!response.ok) throw new Error(`API Error: ${response.statusText} (Status: ${response.status})`);
        const serverConfig = await response.json();
        if (!serverConfig.walletConnectProjectId) throw new Error('WalletConnect Project ID is missing from server config.');

        const projectId = serverConfig.walletConnectProjectId;
        const metadata = {
            name: 'TimaxPay Terminal',
            description: 'TimaxPay Crypto Terminal',
            url: 'https://merch.timaxpay.com',
            icons: ['https://merch.timaxpay.com/logo512.png']
        };

        const wagmiConfig = createConfig({
            chains: EVM_CHAINS_WAGMI,
            connectors: [
                walletConnect({ projectId, metadata, showQrModal: false }),
                injected({ shimDisconnect: true }),
                coinbaseWallet({ appName: metadata.name })
            ],
            transports: EVM_CHAINS_WAGMI.reduce((obj, chain) => ({ ...obj, [chain.id]: http() }), {}),
        });

        // CRITICAL: Initialize the Web3Modal instance BEFORE rendering the React app.
        createWeb3Modal({ wagmiConfig, projectId, enableAnalytics: false, themeMode: 'dark' });

        // Now that all setup is complete, render the full application.
        root.render(
            <AppWrapper config={{ ...serverConfig, wagmiConfig }}>
                <App 
                    transakApiKey={serverConfig.transakApiKey}
                    transakEnvironment={serverConfig.transakEnvironment}
                />
            </AppWrapper>
        );

    } catch (error) {
        console.error("Initialization failed:", error);
        root.render(<StatusDisplay message={`Error: ${error.message}. Please ensure the local API server is running.`} />);
    }
};

// Start the application initialization process
initializeApp();

reportWebVitals();

