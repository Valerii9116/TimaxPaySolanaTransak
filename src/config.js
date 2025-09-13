import { mainnet, polygon, optimism, arbitrum, linea, avalanche, base } from 'wagmi/chains';

// --- EVM CHAINS ---
export const EVM_CHAINS = [
    mainnet, polygon, optimism, arbitrum, linea, avalanche, base,
];

// --- SOLANA CHAIN ---
export const SOLANA_CHAIN = {
  id: 'solana-mainnet',
  name: 'Solana',
  chainType: 'SOLANA',
  nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
};

// --- MERGED LIST FOR UI ---
export const SUPPORTED_CHAINS = [...EVM_CHAINS, SOLANA_CHAIN];

// --- TOKENS ---
export const SUPPORTED_ASSETS = [
    { symbol: 'ETH', name: 'Ethereum', chainType: 'EVM', isNative: true },
    { symbol: 'MATIC', name: 'Polygon', chainType: 'EVM', isNative: true },
    { symbol: 'AVAX', name: 'Avalanche', chainType: 'EVM', isNative: true },
    { symbol: 'USDC', name: 'USD Coin', chainType: 'BOTH', isNative: false },
    { symbol: 'USDT', name: 'Tether', chainType: 'BOTH', isNative: false },
    { symbol: 'PYUSD', name: 'PayPal USD', chainType: 'EVM', isNative: false },
    { symbol: 'EURC', name: 'Euro Coin', chainType: 'EVM', isNative: false },
    { symbol: 'SOL', name: 'Solana', chainType: 'SOLANA', isNative: true },
];

// --- CONTRACT ADDRESSES ---
export const TOKEN_ADDRESSES = {
    [mainnet.id]: {
        'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        'PYUSD': '0x6c3eA247e0624C06453F551811eC3241bB7C4183',
        'EURC': '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bE323'
    },
    [polygon.id]: {
        'USDC': '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        'EURC': '0x4250e639a03C27f6A430168345718288544B3526'
    },
    [arbitrum.id]: { 'USDC': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 'USDT': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' },
    [avalanche.id]: { 'USDC': '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', 'USDT': '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7' },
    [base.id]: { 'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
    [linea.id]: { 'USDC': '0x176211869cA2b568f2A7D4EE941E073a821EE1ff' },
    [optimism.id]: { 'USDC': '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', 'USDT': '0x94b008aA00579c1307B0EF2c499aD98a8CE58e58' },
    'solana-mainnet': {
        'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    }
};

// --- TRANSAK MAPPING ---
export const TRANSAK_NETWORK_MAP = {
    [mainnet.id]: 'ethereum',
    [arbitrum.id]: 'arbitrum',
    [polygon.id]: 'polygon',
    [linea.id]: 'linea',
    [avalanche.id]: 'avalanche',
    [base.id]: 'base',
    [optimism.id]: 'optimism',
    'solana-mainnet': 'solana',
};

