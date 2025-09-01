import React, { useState } from 'react';
import WalletConnector from './components/WalletConnector';
import PaymentTerminal from './components/PaymentTerminal';
import TransactionHistory from './components/TransactionHistory';
import './App.css';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect } from 'wagmi/connectors';

// --- Configuration is now read directly from build-time environment variables ---
const walletConnectProjectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
const transakApiKey = process.env.REACT_APP_TRANSAK_API_KEY;
const transakEnvironment = process.env.REACT_APP_TRANSAK_ENVIRONMENT;

// --- Wagmi and WalletConnect configuration ---
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
      projectId: walletConnectProjectId || '', // Ensure projectId is not undefined
      metadata
    })
  ],
  transports: { [polygon.id]: http() },
});

const queryClient = new QueryClient();

function App() {
  const [status, setStatus] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [merchantAddress, setMerchantAddress] = useState(null);
  const [chain, setChain] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currentView, setCurrentView] = useState('terminal'); // 'terminal' or 'history'
  
  // A simple check to ensure config keys are present
  const isConfigured = walletConnectProjectId && transakApiKey && transakEnvironment;

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

  if (!isConfigured) {
    return (
        <div className="loading-container">
            Configuration is missing. Please ensure environment variables are set.
        </div>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
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
                      apiKey={transakApiKey}
                      environment={transakEnvironment}
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

