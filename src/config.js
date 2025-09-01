import { mainnet, polygon, arbitrum, avalanche, base, linea } from 'wagmi/chains';

// Define all the chains you want to support
export const SUPPORTED_CHAINS = [
  mainnet,
  polygon,
  arbitrum,
  avalanche,
  base,
  linea,
];

// Define all the stablecoins you want to support
export const SUPPORTED_STABLECOINS = [
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'PYUSD', name: 'PayPal USD' },
    { symbol: 'EURC', name: 'Euro Coin' },
];

// Mapping of chain IDs to the network names Transak expects
export const TRANSAK_NETWORK_MAP = {
    [mainnet.id]: 'ethereum',
    [polygon.id]: 'polygon',
    [arbitrum.id]: 'arbitrum',
    [avalanche.id]: 'avalanche_c_chain',
    [base.id]: 'base',
    [linea.id]: 'linea',
};

// Mapping of stablecoin contract addresses for each supported chain
// This is crucial for fetching the correct token balance
export const STABLECOIN_ADDRESSES = {
    [mainnet.id]: {
        'USDC': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        'USDT': '0xdac17f958d2ee523a2206206994597c13d831ec7',
        'PYUSD': '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
        'EURC': '0x1aBaEA1f7C830bD89Acc67eC4af516284b1BC33c',
    },
    [polygon.id]: {
        'USDC': '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        'USDT': '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        'EURC': '0xE2F31c362179851603B64b20436A1e5241A65230',
    },
    [arbitrum.id]: {
        'USDC': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        'USDT': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    },
    [avalanche.id]: {
        'USDC': '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
        'USDT': '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
        'EURC': '0xC891EB4Ca8347851832134231225211531145103'
    },
    [base.id]: {
        'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
    [linea.id]: {
        'USDC': '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    },
};
