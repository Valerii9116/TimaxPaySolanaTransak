import React, { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals.js';

// --- WALLET & PROVIDER CONFIGURATION ---
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { EVM_CHAINS_WAGMI } from './config.js';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletError } from '@solana/wallet-adapter-base';

const queryClient = new QueryClient();

const StatusDisplay = ({ message }) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', padding: '2rem', color: 'white', textAlign: 'center' }}>
        {message}
    </div>
);

const AppWrapper = ({ config, children }) => {
  const solanaEndpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);
  const handleWalletError = (error) => {
    console.error("Solana Wallet Error:", error);
    if (error instanceof WalletError) alert(`Wallet Connection Error: ${error.message}`);
  };

  return (
    <React.StrictMode>
      <WagmiProvider config={config.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ConnectionProvider endpoint={solanaEndpoint}>
            <WalletProvider wallets={wallets} onError={handleWalletError} autoConnect={false}>
              <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </React.StrictMode>
  );
};

const initializeApp = async () => {
    const container = document.getElementById('root');
    if (!container) return;
    const root = createRoot(container);
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
        const wagmiConfig = defaultWagmiConfig({
            chains: EVM_CHAINS_WAGMI,
            projectId,
            metadata,
            coinbasePreference: 'smartWallet' 
        });

        createWeb3Modal({ wagmiConfig, projectId, enableAnalytics: false, themeMode: 'dark', enableOnramp: true });

        root.render(
            <AppWrapper config={{ ...serverConfig, wagmiConfig }}>
                <App transakApiKey={serverConfig.transakApiKey} transakEnvironment={serverConfig.transakEnvironment} />
            </AppWrapper>
        );
    } catch (error) {
        console.error("Initialization failed:", error);
        root.render(<StatusDisplay message={`Error: ${error.message}. Please ensure the API server is running and proxied correctly.`} />);
    }
};

initializeApp();
reportWebVitals();

