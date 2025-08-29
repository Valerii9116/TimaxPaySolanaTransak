
import WalletConnector from './components/WalletConnector';
import PaymentTerminal from './components/PaymentTerminal';
import './App.css';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect } from 'wagmi/connectors';

// Read keys directly from the build environment
const walletConnectProjectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
const transakApiKey = process.env.REACT_APP_TRANSAK_API_KEY;

if (!walletConnectProjectId || !transakApiKey) {
  console.error("CRITICAL ERROR: Build-time environment variables are missing.");
}

const wagmiConfig = createConfig({
  chains: [polygon],
  connectors: [
    injected(),
    walletConnect({ projectId: walletConnectProjectId })
  ],
  transports: { [polygon.id]: http() },
});

function App() {
  const [status, setStatus] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [merchantAddress, setMerchantAddress] = useState(null);
  const [chain, setChain] = useState(null);

  const handleWalletConnect = (address, chainId) => {
    setMerchantAddress(address);
    setIsWalletConnected(!!address);
    setChain(chainId);
  };

  const isWrongNetwork = isWalletConnected && chain !== 137;
  const queryClient = new QueryClient();

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
              
              {isWalletConnected && !isWrongNetwork && (
                <PaymentTerminal 
                  apiKey={transakApiKey}
                  environment={'STAGING'} // Hardcoded for staging tests
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

