import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { walletConnect } from 'wagmi/connectors';
import { mainnet, polygon, bsc } from 'wagmi/chains';
import { WagmiProvider, createConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// This file is the specific fix for the deployment build error.
// It correctly initializes all the wallet providers with the modern syntax.
const WalletAdapters = ({ children, serverConfig }) => {
    const solanaNetwork = 'devnet';
    const endpoint = useMemo(() => clusterApiUrl(solanaNetwork), []);
    const solanaWallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

    const queryClient = new QueryClient();
    const projectId = serverConfig.walletConnectProjectId;

    const metadata = {
        name: 'TimaxPay Terminal',
        description: 'A terminal for crypto payments.',
        url: window.location.host,
        icons: []
    };
    
    const chains = [mainnet, polygon, bsc];
    const wagmiConfig = createConfig({
        chains,
        transports: {
            [mainnet.id]: walletConnect({ projectId, metadata, showQrModal: false }),
            [polygon.id]: walletConnect({ projectId, metadata, showQrModal: false }),
            [bsc.id]: walletConnect({ projectId, metadata, showQrModal: false }),
        },
        connectors: [
            walletConnect({ projectId, metadata, showQrModal: false }),
        ],
    });

    createWeb3Modal({ wagmiConfig, projectId });

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

export default WalletAdapters;

