import React, { useState, useEffect } from 'react';
import WalletConnector from './components/WalletConnector';
import PaymentTerminal from './components/PaymentTerminal';
import './App.css';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect } from 'wagmi/connectors';
import { SUPPORTED_CHAINS } from './config';
import { polygon } from 'wagmi/chains';

function App() {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [merchantAddress, setMerchantAddress] = useState(null);
  const [chain, setChain] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedChain, setSelectedChain] = useState(polygon); 
  const [selectedStablecoin, setSelectedStablecoin] = useState('USDC');

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/getConfig');
        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText} (Status: ${response.status})`);
        }
        const serverConfig = await response.json();

        if (!serverConfig.walletConnectProjectId || !serverConfig.transakApiKey || !serverConfig.transakEnvironment) {
          throw new Error('Configuration from server is missing required keys.');
        }

        const metadata = {
          name: 'TimaxPay Merchant Terminal',
          description: 'Connect your wallet.',
          url: 'https://merch.timaxpay.com',
          icons: ['https://merch.timaxpay.com/logo512.png']
        };

        const wagmiConfig = createConfig({
          chains: SUPPORTED_CHAINS,
          connectors: [
            injected(),
            walletConnect({
              projectId: serverConfig.walletConnectProjectId,
              metadata
            })
          ],
          transports: SUPPORTED_CHAINS.reduce((obj, chain) => ({ ...obj, [chain.id]: http() }), {}),
        });

        setConfig({
          wagmi: wagmiConfig,
          transakApiKey: serverConfig.transakApiKey,
          transakEnvironment: serverConfig.transakEnvironment
        });

      } catch (error) {
        console.error("Config fetch error:", error);
        setStatus(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleWalletConnect = (address, chainId) => {
    setMerchantAddress(address);
    setIsWalletConnected(!!address);
    setChain(chainId);
  };

  const isWrongNetwork = isWalletConnected && chain !== selectedChain.id;

  if (isLoading || !config) {
    return <div className="loading-container">{status || 'Loading Configuration...'}</div>;
  }

  const queryClient = new QueryClient();

  const renderContent = () => {
    if (!isWalletConnected) {
      return (
        <div className="connection-view">
          <div className="step-card">
            <WalletConnector 
              onConnect={handleWalletConnect} 
              selectedChain={selectedChain}
              selectedStablecoin={selectedStablecoin}
            />
          </div>
        </div>
      );
    }
    
    return (
      <div className="application-view">
        <div className="step-card">
          <WalletConnector 
            onConnect={handleWalletConnect} 
            selectedChain={selectedChain}
            selectedStablecoin={selectedStablecoin}
          />
        </div>
        
        <PaymentTerminal
            apiKey={config.transakApiKey}
            environment={config.transakEnvironment}
            merchantAddress={merchantAddress}
            setStatus={setStatus}
            selectedChain={selectedChain}
            setSelectedChain={setSelectedChain}
            selectedStablecoin={selectedStablecoin}
            setSelectedStablecoin={setSelectedStablecoin}
            isInteractionDisabled={isWrongNetwork}
        />
      </div>
    );
  };

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
              {renderContent()}
              {status && <p className="status-message main-status">{status}</p>}
            </main>
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
export default App;

