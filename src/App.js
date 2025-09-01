import React, { useState, useEffect } from 'react';
import WalletConnector from './components/WalletConnector';
import PaymentTerminal from './components/PaymentTerminal';
import TransactionHistory from './components/TransactionHistory';
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
  const [transactions, setTransactions] = useState([]);
  const [currentView, setCurrentView] = useState('terminal'); // 'terminal' or 'history'

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/getConfig');
        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(errorBody.error || 'Failed to fetch server configuration.');
        }
        const serverConfig = await response.json();

        if (!serverConfig.walletConnectProjectId || !serverConfig.transakApiKey || !serverConfig.transakEnvironment) {
          throw new Error('Configuration from server is missing required keys.');
        }

        const metadata = {
          name: 'TimaxPay Merchant Terminal',
          description: 'Connect your wallet to the TimaxPay Merchant Terminal.',
          url: 'https://merch.timaxpay.com',
          icons: ['https://merch.timaxpay.com/logo512.png']
        };

        const wagmiConfig = createConfig({
          chains: [polygon],
          connectors: [
            injected(),
            walletConnect({ 
              projectId: serverConfig.walletConnectProjectId,
              metadata
            })
          ],
          transports: { [polygon.id]: http() },
        });

        setConfig({ 
          wagmi: wagmiConfig, 
          transakApiKey: serverConfig.transakApiKey,
          transakEnvironment: serverConfig.transakEnvironment
        });

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
    if (!address) {
      setCurrentView('terminal');
    }
  };

  const handleNewTransaction = (transactionData) => {
    setTransactions(prevTransactions => {
      const isDuplicate = prevTransactions.some(tx => tx.id === transactionData.id);
      if (isDuplicate) {
        return prevTransactions;
      }
      return [transactionData, ...prevTransactions];
    });
    setCurrentView('history');
  };

  const isWrongNetwork = isWalletConnected && chain !== 137;

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
              
              {isWrongNetwork && <p className="error-message">Please switch your wallet to the Polygon network to continue.</p>}

              {isWalletConnected && !isWrongNetwork && (
                <>
                  <nav className="main-nav">
                    <button 
                      onClick={() => setCurrentView('terminal')} 
                      className={currentView === 'terminal' ? 'active' : ''}
                    >
                      Terminal
                    </button>
                    <button 
                      onClick={() => setCurrentView('history')} 
                      className={currentView === 'history' ? 'active' : ''}
                    >
                      History
                    </button>
                  </nav>

                  {currentView === 'terminal' && (
                    <PaymentTerminal 
                      apiKey={config.transakApiKey}
                      environment={config.transakEnvironment}
                      merchantAddress={merchantAddress} 
                      setStatus={setStatus} 
                      onNewTransaction={handleNewTransaction}
                    />
                  )}
                  
                  {currentView === 'history' && (
                    <TransactionHistory transactions={transactions} />
                  )}
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

