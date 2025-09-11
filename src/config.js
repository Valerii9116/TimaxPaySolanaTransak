import { mainnet, polygon, optimism, arbitrum, linea, avalanche, base } from 'wagmi/chains';

// Define the EVM chains supported by the application, configured for Wagmi.
export const EVM_CHAINS_WAGMI = [mainnet, polygon, optimism, arbitrum, linea, avalanche, base];

// Create a unified list of all supported chains (EVM and Solana) for UI components.
export const SUPPORTED_CHAINS = [
    {
        id: 'solana',
        name: 'Solana',
        chainType: 'SOLANA',
        nativeCurrency: { symbol: 'SOL', name: 'Solana', decimals: 9 }
    },
    // Map the Wagmi chain objects to a consistent format for our app
    ...EVM_CHAINS_WAGMI.map(chain => ({
        id: chain.id,
        name: chain.name,
        chainType: 'EVM',
        nativeCurrency: chain.nativeCurrency
    }))
];

// Define the list of supported crypto assets.
// 'BOTH' indicates the asset is available on EVM and Solana.
export const SUPPORTED_ASSETS = [
    { symbol: 'USDC', name: 'USD Coin', chainType: 'BOTH' },
    { symbol: 'USDT', name: 'Tether', chainType: 'BOTH' },
    { symbol: 'ETH', name: 'Ethereum', chainType: 'EVM' },
    { symbol: 'SOL', name: 'Solana', chainType: 'SOLANA' },
    { symbol: 'PYUSD', name: 'PayPal USD', chainType: 'EVM' },
    { symbol: 'EURC', name: 'Euro Coin', chainType: 'EVM' },
];
