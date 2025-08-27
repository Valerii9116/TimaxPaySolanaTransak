import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygon, mainnet, arbitrum, linea, avalanche } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect } from 'wagmi/connectors';

// You need a WalletConnect Project ID to enable mobile wallet connections.
// Get yours at https://cloud.walletconnect.com
const projectId = 'dc14d146c0227704322ac9a46aaed7cd';

const config = createConfig({
  chains: [polygon, mainnet, arbitrum, linea, avalanche],
  connectors: [
    injected(),
    walletConnect({ projectId })
  ],
transports: {
    [polygon.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [linea.id]: http(),
    [avalanche.id]: http(),
  },
});

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
