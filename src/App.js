import React, { useState, useEffect } from 'react';
import WalletConnector from './components/WalletConnector';
import PaymentTerminal from './components/PaymentTerminal';
import './App.css';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect } from 'wagmi/connectors';

function App() {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [merchantAddress, setMerchantAddress] = useState(null);
  const [chain, setChain] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/getConfig');
        if (!response.ok) throw new Error('Failed to fetch server configuration.');
        const serverConfig = await response.json();

        if (!serverConfig.walletConnectProjectId || !serverConfig.transakApiKey) {
          throw new Error('Configuration from server is missing required keys.');
        }

        const wagmiConfig = createConfig({
          chains: [polygon],
          connectors: [
            injected(),
            walletConnect({ projectId: serverConfig.walletConnectProjectId })
          ],
          transports: { [polygon.id]: http() },
        });

        setConfig({ wagmi: wagmiConfig, transak: serverConfig.transakApiKey });
      } catch (error) {
        console.error("Config fetch error:", error);
        setStatus(`Error: ${error.message}`);
      }
    };
    fetchConfig();
  }, []);

  const handleWalletConnect = (address, chainId) => {
    setMerchantAddress(address);
    setIsWalletConnected(!!address);
    setChain(chainId);
  };

  const isWrongNetwork = isWalletConnected && chain !== 137;

  // Render a loading state until the configuration is fetched
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
              {isWrongNetwork && <p className="error-message">Please switch wallet to Polygon to continue.</p>}
              {isWalletConnected && !isWrongNetwork && (
                <PaymentTerminal 
                  apiKey={config.transak} 
                  merchantAddress={merchantAddress} 
                  setStatus={setStatus} 
                />
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
