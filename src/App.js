import React, { useState, useEffect } from 'react';
import WalletConnector from './components/WalletConnector';
import PaymentTerminal from './components/PaymentTerminal';
import TransactionHistory from './components/TransactionHistory';
import './App.css';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygon, mainnet, arbitrum, linea, avalanche } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { walletConnect } from 'wagmi/connectors';

function App() {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [merchantAddress, setMerchantAddress] = useState(null);
  const [chain, setChain] = useState(null);

  useEffect(() => {
    // This is a placeholder for fetching secrets in a real app
    const serverConfig = {
      walletConnectProjectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID,
      transakApiKey: process.env.REACT_APP_TRANSAK_API_KEY,
      transakEnvironment: process.env.REACT_APP_TRANSAK_ENVIRONMENT || 'STAGING'
    };

    if (!serverConfig.walletConnectProjectId || !serverConfig.transakApiKey) {
      const errorMsg = "Configuration keys are missing.";
      setStatus(`Error: ${errorMsg}`);
      console.error(errorMsg);
      return;
    }

    const wagmiConfig = createConfig({
      chains: [polygon, mainnet, arbitrum, linea, avalanche],
      connectors: [
        walletConnect({ projectId: serverConfig.walletConnectProjectId })
      ],
      transports: {
        [polygon.id]: http(),
        [mainnet.id]: http(),
        [arbitrum.id]: http(),
        [linea.id]: http(),
        [avalanche.id]: http(),
      },
    });

    setConfig({
      wagmi: wagmiConfig,
      transakApiKey: serverConfig.transakApiKey,
      transakEnvironment: serverConfig.transakEnvironment
    });
  }, []);

  const handleWalletConnect = (address, chainId) => {
    setMerchantAddress(address);
    setIsWalletConnected(!!address);
    setChain(chainId);
  };

  if (!config) {
    return <div className="loading-container">{status || 'Loading Configuration...'}</div>;
  }

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config.wagmi}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <div className="app-container">
            <header className="App-header">
              <h1>TimaxPay Merchant Terminal</h1>
              <p className="subtitle">Accept fiat, receive crypto.</p>
            </header>
            <main className="App-main">
              <div className="step-card">
                <WalletConnector onConnect={handleWalletConnect} />
              </div>
              
              {isWalletConnected && (
                <>
                  <PaymentTerminal
                    apiKey={config.transakApiKey}
                    environment={config.transakEnvironment}
                    merchantAddress={merchantAddress}
                    setStatus={setStatus}
                    activeChainId={chain}
                  />
                  <TransactionHistory merchantAddress={merchantAddress} />
                </>
              )}

              {status && <p className="status-message main-status">{status}</p>}
            </main>
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
export default App;