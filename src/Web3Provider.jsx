import React, { useMemo } from 'react';

// Solana Imports
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// EVM (Wagmi) Imports
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';
import { EVM_CHAINS_WAGMI } from './config';

// This component wraps the entire application and provides all necessary
// blockchain connection context for both EVM and Solana.
const Web3Provider = ({ children, serverConfig }) => {
    // --- Solana Configuration ---
    const solanaNetwork = 'mainnet-beta';
    const endpoint = useMemo(() => clusterApiUrl(solanaNetwork), []);
    const solanaWallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
    ], []);

    // --- EVM (Wagmi) Configuration ---
    const queryClient = new QueryClient();
    const projectId = serverConfig.walletConnectProjectId;

    const metadata = {
        name: 'TimaxPay Terminal',
        description: 'Accept fiat & crypto payments seamlessly.',
        url: window.location.host,
        icons: ['https://wallectconnect.com/walletconnect-logo.png'] // Example icon
    };

    const wagmiConfig = createConfig({
        chains: EVM_CHAINS_WAGMI,
        transports: EVM_CHAINS_WAGMI.reduce(
            (obj, chain) => ({ ...obj, [chain.id]: http() }), {}
        ),
        connectors: [
            walletConnect({ projectId, metadata, showQrModal: false }), // Web3Modal handles the QR modal
            injected({ shimDisconnect: true }),
            coinbaseWallet({ appName: 'TimaxPay Terminal', darkMode: true }),
        ],
    });

    // --- Initialize Web3Modal ---
    createWeb3Modal({
        wagmiConfig,
        projectId,
        themeMode: 'dark',
        enableOnramp: true, // Integrates fiat-on-ramp services
        themeVariables: {
            '--w3m-accent': '#3B82F6',
            '--w3m-border-radius-master': '12px'
        }
    });

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <ConnectionProvider endpoint={endpoint}>
                    <WalletProvider wallets={solanaWallets} autoConnect={false}>
                        <WalletModalProvider>
                            {children}
                        </WalletModalProvider>
                    </WalletProvider>
                </ConnectionProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

export default Web3Provider;
