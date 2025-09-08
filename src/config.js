import { polygon, mainnet, arbitrum, base, avalanche, optimism, linea } from 'wagmi/chains';

// Define the wagmi chain objects for easy access in index.js
export const EVM_CHAINS_WAGMI = [polygon, mainnet, arbitrum, base, avalanche, optimism, linea];

// Define the application's chain configuration for use in the UI
export const SUPPORTED_CHAINS = [
    { id: 1, name: 'Ethereum', chainType: 'EVM' },
    { id: 137, name: 'Polygon', chainType: 'EVM' },
    { id: 42161, name: 'Arbitrum', chainType: 'EVM' },
    { id: 8453, name: 'Base', chainType: 'EVM' },
    { id: 43114, name: 'Avalanche', chainType: 'EVM' },
    { id: 10, name: 'OP Mainnet', chainType: 'EVM' },
    { id: 59144, name: 'Linea', chainType: 'EVM' },
    { id: 'solana', name: 'Solana', chainType: 'SOLANA' }
];

// Define assets available in the terminal
export const SUPPORTED_ASSETS = {
    'ETH': { name: 'Ethereum', type: 'NATIVE', decimals: 18 }, 
    'USDC': { name: 'USD Coin', type: 'TOKEN', decimals: 6 },
    'USDT': { name: 'Tether', type: 'TOKEN', decimals: 6 }, 
    'PYUSD': { name: 'PayPal USD', type: 'TOKEN', decimals: 6 },
    'EURC': { name: 'EUR Coin', type: 'TOKEN', decimals: 6 },
    'SOL': { name: 'Solana', type: 'NATIVE', decimals: 9 }
};

// Map of asset contract addresses by chain ID
export const ASSET_ADDRESSES = {
    // Ethereum (Mainnet) - ID 1
    1: { 
        'ETH': 'NATIVE', 
        'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        'PYUSD': '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
        'EURC': '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bB36D'
    },
    // Polygon - ID 137
    137: { 
        'ETH': 'NATIVE', // Represents MATIC on Polygon PoS
        'USDC': '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // Bridged (PoS)
        'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        // PYUSD & EURC are not officially bridged to Polygon PoS as of late 2023/early 2024
    },
    // Arbitrum - ID 42161
    42161: {
        'ETH': 'NATIVE',
        'USDC': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        'USDT': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        'PYUSD': '0x644192291cc835A93d6330b24EA5f5FEdD0eEF9e'
    },
    // Base - ID 8453
    8453: {
        'ETH': 'NATIVE',
        'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913'
    },
    // Avalanche C-Chain - ID 43114
    43114: {
        'ETH': 'NATIVE', // Represents AVAX
        'USDC': '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
        'USDT': '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    },
    // OP Mainnet - ID 10
    10: {
        'ETH': 'NATIVE',
        'USDC': '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        'USDT': '0x94b008aA00579c1307B0EF2c499aD98a8CE58e58',
    },
    // Linea - ID 59144
    59144: {
        'ETH': 'NATIVE',
        'USDC': '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    },
    // Solana
    'solana': { 
        'SOL': 'NATIVE', 
        'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7uP3', 
        'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    }
};

// Mapping for Transak SDK network parameter
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

