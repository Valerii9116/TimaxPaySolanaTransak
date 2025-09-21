// config.js - Central configuration for the frontend application.

import { mainnet, polygon, optimism, arbitrum, bsc } from 'wagmi/chains';

// --- ACTION REQUIRED ---
// Replace the placeholder below with your actual Alchemy API key.
// You can get a free key from https://www.alchemy.com/
const ALCHEMY_API_KEY = 'dGmZ3QehQO2xkopzyGqc9';

export const EVM_CHAINS = [mainnet, polygon, optimism, arbitrum, bsc];

export const SUPPORTED_NETWORKS = {
  // Ethereum Mainnet
  1: {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: [`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`],
    blockExplorerUrls: ['https://etherscan.io'],
    chainType: 'EVM'
  },
  // Polygon
  137: {
    id: 137,
    name: 'Polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: [`https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`],
    blockExplorerUrls: ['https://polygonscan.com'],
    chainType: 'EVM'
  },
  // Arbitrum
  42161: {
    id: 42161,
    name: 'Arbitrum One',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: [`https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`],
    blockExplorerUrls: ['https://arbiscan.io'],
    chainType: 'EVM'
  },
  // Base
  8453: {
    id: 8453,
    name: 'Base',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org'], // Base has a public RPC
    blockExplorerUrls: ['https://basescan.org'],
    chainType: 'EVM'
  },
  // Solana
  'solana': {
    id: 'solana',
    name: 'Solana',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
    rpcUrls: ['https://api.mainnet-beta.solana.com'],
    blockExplorerUrls: ['https://explorer.solana.com'],
    chainType: 'SOLANA'
  }
};

export const SUPPORTED_TOKENS = {
  // Ethereum tokens
  1: {
    'ETH': { address: 'native', decimals: 18, symbol: 'ETH', name: 'Ethereum' },
    'USDC': { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, symbol: 'USDC', name: 'USD Coin' },
    'USDT': { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, symbol: 'USDT', name: 'Tether USD' },
    'WBTC': { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8, symbol: 'WBTC', name: 'Wrapped Bitcoin' }
  },
  // Polygon tokens
  137: {
    'MATIC': { address: 'native', decimals: 18, symbol: 'MATIC', name: 'Polygon' },
    'USDC': { address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6, symbol: 'USDC', name: 'USD Coin' },
    'USDT': { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, symbol: 'USDT', name: 'Tether USD' },
    'WETH': { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', decimals: 18, symbol: 'WETH', name: 'Wrapped Ethereum' }
  },
  // Arbitrum tokens
  42161: {
    'ETH': { address: 'native', decimals: 18, symbol: 'ETH', name: 'Ethereum' },
    'USDC': { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, symbol: 'USDC', name: 'USD Coin' },
    'USDT': { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, symbol: 'USDT', name: 'Tether USD' },
    'WBTC': { address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', decimals: 8, symbol: 'WBTC', name: 'Wrapped Bitcoin' }
  },
  // Base tokens
  8453: {
    'ETH': { address: 'native', decimals: 18, symbol: 'ETH', name: 'Ethereum' },
    'USDC': { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, symbol: 'USDC', name: 'USD Coin' },
    'WETH': { address: '0x4200000000000000000000000000000000000006', decimals: 18, symbol: 'WETH', name: 'Wrapped Ethereum' }
  },
  // Solana tokens
  'solana': {
    'SOL': { address: 'native', decimals: 9, symbol: 'SOL', name: 'Solana' },
    'USDC': { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, symbol: 'USDC', name: 'USD Coin' },
    'USDT': { address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, symbol: 'USDT', name: 'Tether USD' }
  }
};

export const TRANSAK_NETWORK_MAP = {
  1: 'ethereum',
  137: 'polygon',
  42161: 'arbitrum',
  8453: 'base',
  'solana': 'solana'
};

export const LIFI_CONFIG = {
  API_URL: 'https://li.quest/v1',
  INTEGRATOR: 'Timax_swap',
  FEE_PERCENTAGE: 0.005, // 0.5% fee
  FEE_RECIPIENT: '0x34accc793fD8C2A8e262C8C95b18D706bc6022f0', // Your fee wallet
  SUPPORTED_CHAINS: [1, 137, 42161, 8453], // EVM chains only for LI.FI
};

