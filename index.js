import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect } from 'wagmi/connectors';

// You need a WalletConnect Project ID to enable mobile wallet connections.
// Get yours at https://cloud.walletconnect.com
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID';

const config = createConfig({
  chains: [polygon],
  connectors: [
    injected(),
    walletConnect({ projectId })
  ],
  transports: {
    [polygon.id]: http(),
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
