// Updated TerminalProvider.jsx
import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

// --- Configuration Data ---
// This data was moved from the (missing/incorrect) config.js file to resolve the error.
const SUPPORTED_CHAINS = [
    { id: 1, name: 'Ethereum', chainType: 'EVM' },
    { id: 137, name: 'Polygon', chainType: 'EVM' },
    { id: 10, name: 'Optimism', chainType: 'EVM' },
    { id: 42161, name: 'Arbitrum', chainType: 'EVM' },
    { id: 56, name: 'BNB Chain', chainType: 'EVM' },
    { id: 'solana', name: 'Solana', chainType: 'SOLANA' },
];

const SUPPORTED_ASSETS = [
    { symbol: 'ETH', chainType: 'EVM' },
    { symbol: 'USDC', chainType: 'BOTH' },
    { symbol: 'USDT', chainType: 'BOTH' },
    { symbol: 'MATIC', chainType: 'EVM' },
    { symbol: 'WETH', chainType: 'EVM' },
    { symbol: 'SOL', chainType: 'SOLANA' },
    { symbol: 'Bonk', chainType: 'SOLANA' },
];
// --- End of Configuration Data ---


const TerminalContext = createContext();

export const useTerminal = () => useContext(TerminalContext);

export const TerminalProvider = ({ children }) => {
  const [mode, setMode] = useState('ACCEPT_FIAT');
  const [status, setStatus] = useState({ type: 'info', message: 'Welcome to the TimaxPay Terminal' });
  const [amount, setAmount] = useState('');
  
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState('');

  // This effect updates the available assets whenever the selected chain changes.
  useEffect(() => {
    const assetsForChain = SUPPORTED_ASSETS.filter(asset => {
      if (selectedChain.chainType === 'SOLANA') {
        return asset.chainType === 'SOLANA' || asset.chainType === 'BOTH';
      } else { // EVM
        return asset.chainType === 'EVM' || asset.chainType === 'BOTH';
      }
    });
    setAvailableAssets(assetsForChain);
    // Set the first available asset as the default for the new chain
    if (assetsForChain.length > 0) {
      setSelectedAsset(assetsForChain[0].symbol);
    } else {
      setSelectedAsset('');
    }
  }, [selectedChain]);

  const setAppStatus = (message, type = 'info') => {
    setStatus({ message, type });
    
    // Auto-clear success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        setStatus({ type: 'info', message: '' });
      }, 5000);
    }
  };

  const handleChainChange = (newChainIdOrName) => {
    const newChain = SUPPORTED_CHAINS.find(c => 
        String(c.id) === String(newChainIdOrName) || c.name === newChainIdOrName
    );
    if (newChain) {
        setSelectedChain(newChain);
        setAppStatus(`Switched to ${newChain.name} network.`, 'success');
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setAmount(''); // Clear amount when switching modes
    
    // Set appropriate status message for each mode
    switch (newMode) {
      case 'ACCEPT_FIAT':
        setAppStatus('Ready to accept fiat payments through Transak', 'info');
        break;
      case 'ACCEPT_CRYPTO':
        setAppStatus('Ready to accept crypto payments', 'info');
        break;
      case 'SEND':
        setAppStatus('Ready to send crypto to another address', 'info');
        break;
      case 'BRIDGE':
        setAppStatus('Ready to bridge tokens across different chains', 'info');
        break;
      case 'WITHDRAW':
        setAppStatus('Ready to withdraw crypto to bank account', 'info');
        break;
      default:
        setAppStatus('Welcome to the TimaxPay Terminal', 'info');
    }
  };

  // Available modes with their display names
  const availableModes = [
    { id: 'ACCEPT_FIAT', label: 'Accept Fiat', description: 'Charge customers in fiat currency' },
    { id: 'ACCEPT_CRYPTO', label: 'Accept Crypto', description: 'Accept direct crypto payments' },
    { id: 'SEND', label: 'Send Crypto', description: 'Send crypto to another wallet' },
    { id: 'BRIDGE', label: 'Bridge', description: 'Bridge tokens across chains' },
    { id: 'WITHDRAW', label: 'Withdraw', description: 'Withdraw crypto to bank' }
  ];

  const value = useMemo(() => ({
    // Core state
    mode,
    setMode: handleModeChange,
    availableModes,
    
    // Status management
    status,
    setAppStatus,
    
    // Amount management
    amount,
    setAmount,
    
    // Chain and asset management
    supportedChains: SUPPORTED_CHAINS, // <-- FIX: Provide the full list of chains
    selectedChain,
    setSelectedChain: handleChainChange,
    selectedAsset,
    setSelectedAsset,
    availableAssets,
    
    // Utility functions
    clearForm: () => {
      setAmount('');
      setAppStatus('Form cleared', 'info');
    },
    
    // Bridge-specific state (if needed for future enhancements)
    bridgeConfig: {
      defaultFromChain: '1', // Ethereum
      defaultToChain: '137', // Polygon
      supportedProtocols: ['LI.FI', 'Stargate', 'Hop Protocol']
    }
  }), [
    mode, 
    status, 
    amount, 
    selectedChain, 
    selectedAsset, 
    availableAssets,
    availableModes
  ]);

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  );
};

TerminalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

