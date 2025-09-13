import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  SolletWalletAdapter,
  SolletExtensionWalletAdapter,
  MathWalletAdapter,
  Coin98WalletAdapter,
  SlopeWalletAdapter,
  BitKeepWalletAdapter,
  BitpieWalletAdapter,
  CloverWalletAdapter,
  SafePalWalletAdapter,
  TrustWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { walletConnect, injected, coinbaseWallet, metaMask } from 'wagmi/connectors';
import { EVM_CHAINS_WAGMI } from './config';

// Import required CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletAdapters = ({ children, serverConfig }) => {
  const solanaNetwork = 'mainnet-beta';
  const endpoint = useMemo(() => clusterApiUrl(solanaNetwork), []);
  
  // Configure all available Solana wallets
  const solanaWallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TorusWalletAdapter(),
    new LedgerWalletAdapter(),
    new SolletWalletAdapter(),
    new SolletExtensionWalletAdapter(),
    new MathWalletAdapter(),
    new Coin98WalletAdapter(),
    new SlopeWalletAdapter(),
    new BitKeepWalletAdapter(),
    new BitpieWalletAdapter(),
    new CloverWalletAdapter(),
    new SafePalWalletAdapter(),
    new TrustWalletAdapter(),
  ], []);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        retryDelay: 1000,
      },
    },
  });

  const projectId = serverConfig.walletConnectProjectId;
  
  const metadata = {
    name: 'TimaxPay Terminal',
    description: 'Accept fiat, receive crypto.',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:5173',
    icons: ['https://walletconnect.com/walletconnect-logo.png']
  };

  const wagmiConfig = createConfig({
    chains: EVM_CHAINS_WAGMI,
    transports: EVM_CHAINS_WAGMI.reduce(
      (obj, chain) => ({ ...obj, [chain.id]: http() }), {}
    ),
    connectors: [
      injected({ shimDisconnect: true }),
      metaMask({
        dappMetadata: {
          name: 'TimaxPay Terminal',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:5173',
        }
      }),
      walletConnect({ 
        projectId, 
        metadata, 
        showQrModal: false,
        qrModalOptions: {
          themeMode: 'dark'
        }
      }),
      coinbaseWallet({ 
        appName: 'TimaxPay Terminal',
        appLogoUrl: 'https://walletconnect.com/walletconnect-logo.png'
      }),
    ],
    ssr: false,
  });

  // Create Web3Modal with enhanced configuration
  if (typeof window !== 'undefined') {
    createWeb3Modal({ 
      wagmiConfig, 
      projectId, 
      themeMode: 'dark',
      themeVariables: {
        '--w3m-font-family': 'Inter, sans-serif',
        '--w3m-accent': '#3498db',
      },
      enableAnalytics: false,
      enableOnramp: true,
      enableSwaps: false,
      allowUnsupportedChain: false,
    });
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider 
          endpoint={endpoint}
          config={{
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
          }}
        >
          <WalletProvider 
            wallets={solanaWallets} 
            autoConnect={false}
            onError={(error) => {
              console.error('Wallet error:', error);
            }}
          >
            <WalletModalProvider>
              {children}
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default WalletAdapters;