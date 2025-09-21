import React, { useMemo, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConfig } from './ConfigProvider';
import { EVM_CHAINS, SUPPORTED_NETWORKS } from '../config';

const queryClient = new QueryClient();

// This function creates the Wagmi config using the RPC URLs from your config file.
const getWagmiConfig = (projectId) => {
    // Dynamically create transports from the config file for better stability
    const transports = EVM_CHAINS.reduce((acc, chain) => {
        const networkConfig = SUPPORTED_NETWORKS[chain.id];
        // Use the specific RPC URL from your config file if it exists
        if (networkConfig && networkConfig.rpcUrls[0] && !networkConfig.rpcUrls[0].includes('YOUR_ALCHEMY_API_KEY_HERE')) {
            acc[chain.id] = http(networkConfig.rpcUrls[0]);
        } else {
            // Provide a public fallback if no key is found, which may be rate-limited
            acc[chain.id] = http(); 
        }
        return acc;
    }, {});

    return createConfig({
        chains: [...EVM_CHAINS],
        projectId,
        transports,
        connectors: [
            walletConnect({
                projectId,
                metadata: {
                    name: 'TimaxPay Terminal',
                    description: 'Accept fiat, receive crypto',
                    url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:5173',
                    icons: ['https://walletconnect.com/walletconnect-logo.png']
                }
            }),
            injected({ shimDisconnect: true }),
            coinbaseWallet({
                appName: 'TimaxPay Terminal',
                darkMode: true
            })
        ],
        ssr: false,
    });
};

export const WalletProviders = ({ children }) => {
    const { walletConnectProjectId } = useConfig();
    const [wagmiConfig, setWagmiConfig] = useState(null);
    const isModalCreated = useRef(false);

    // Effect to initialize Wagmi and create the Web3Modal
    useEffect(() => {
        if (walletConnectProjectId) {
            const config = getWagmiConfig(walletConnectProjectId);
            setWagmiConfig(config);

            if (!isModalCreated.current && config) {
                createWeb3Modal({
                    wagmiConfig: config,
                    projectId: walletConnectProjectId,
                    enableAnalytics: false,
                    themeMode: 'dark',
                });
                isModalCreated.current = true;
            }
        }
    }, [walletConnectProjectId]);
    
    // Solana configuration
    const solanaNetwork = 'mainnet-beta';
    const endpoint = useMemo(() => clusterApiUrl(solanaNetwork), [solanaNetwork]);
    const wallets = useMemo(() => [], []); // Rely on wallet-standard for Solana wallets

    const onError = (error) => {
        console.error('Solana Wallet Error:', error);
    };

    // Render a loading state until the Wagmi config is ready.
    if (!wagmiConfig) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <p>Initializing Wallets...</p>
                </div>
            </div>
        );
    }

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <ConnectionProvider endpoint={endpoint}>
                    <WalletProvider wallets={wallets} onError={onError} autoConnect={false}>
                        <WalletModalProvider>
                            {children}
                        </WalletModalProvider>
                    </WalletProvider>
                </ConnectionProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

WalletProviders.propTypes = {
    children: PropTypes.node.isRequired,
};

