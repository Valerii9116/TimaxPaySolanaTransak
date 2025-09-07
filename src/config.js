import { mainnet, polygon, arbitrum, base, avalanche, optimism, linea } from 'wagmi/chains';

// 1. Supported Chains
export const SUPPORTED_CHAINS = [
    mainnet,
    linea,
    polygon,
    arbitrum,
    base,
    avalanche,
    optimism,
];

// 2. Supported Stablecoins
export const SUPPORTED_STABLECOINS = [
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'PYUSD', name: 'PayPal USD' },
    { symbol: 'EURC', name: 'Euro Coin' }
];

// 3. Transak Network Mapping
export const TRANSAK_NETWORK_MAP = {
    [mainnet.id]: 'ethereum',
    [polygon.id]: 'polygon',
    [arbitrum.id]: 'arbitrum',
    [base.id]: 'base',
    [avalanche.id]: 'avalanche',
    [optimism.id]: 'optimism',
    [linea.id]: 'linea',
};


// 4. Stablecoin Addresses
export const STABLECOIN_ADDRESSES = {
    [mainnet.id]: {
        'ETH': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        'PYUSD': '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8'
    },
    [polygon.id]: {
        'USDC': '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    },
    [arbitrum.id]: {
        'USDC': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        'USDT': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    },
    [base.id]: {
        'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913'
    },
    [avalanche.id]: {
        'USDC': '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
        'USDT': '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7'
    },
    [optimism.id]: {
        'USDC': '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        'USDT': '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'
    },
    [linea.id]: {
        'USDC': '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    }
};
