import { polygon, mainnet, arbitrum, base, avalanche, optimism, linea } from 'wagmi/chains';

// --- CONFIGURATION ---

// This array is used to configure wagmi and Web3Modal
export const EVM_CHAINS_WAGMI = [polygon, mainnet, arbitrum, base, avalanche, optimism, linea];

// This array is used for the network selector dropdown in the UI
export const SUPPORTED_CHAINS = [
    { id: 137, name: 'Polygon', chainType: 'EVM' },
    { id: 1, name: 'Ethereum', chainType: 'EVM' },
    { id: 42161, name: 'Arbitrum', chainType: 'EVM' },
    { id: 8453, name: 'Base', chainType: 'EVM' },
    { id: 43114, name: 'Avalanche', chainType: 'EVM' },
    { id: 10, name: 'OP Mainnet', chainType: 'EVM' },
    { id: 59144, name: 'Linea', chainType: 'EVM' },
    { id: 'solana', name: 'Solana', chainType: 'SOLANA' }
];

// This object defines the assets available on each network
export const SUPPORTED_ASSETS = {
    'ETH': { name: 'Ethereum', type: 'NATIVE', decimals: 18 },
    'USDC': { name: 'USD Coin', type: 'TOKEN', decimals: 6 },
    'USDT': { name: 'Tether', type: 'TOKEN', decimals: 6 },
    'PYUSD': { name: 'PayPal USD', type: 'TOKEN', decimals: 6 },
    'SOL': { name: 'Solana', type: 'NATIVE', decimals: 9 }
};

// Contract/Mint addresses for token assets
export const ASSET_ADDRESSES = {
    1: { 'ETH': 'NATIVE', 'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    137: { 'ETH': 'NATIVE', 'USDC': '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' },
    'solana': { 'SOL': 'NATIVE', 'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7uP3', 'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' }
    // Add other chains and their token addresses here
};

// Mapping for Transak SDK
export const TRANSAK_NETWORK_MAP = {
    1: 'ETHEREUM',
    137: 'POLYGON',
    42161: 'ARBITRUM',
    8453: 'BASE',
    43114: 'AVALANCHEC',
    10: 'OPTIMISM',
    59144: 'LINEA',
    'solana': 'SOLANA'
};

