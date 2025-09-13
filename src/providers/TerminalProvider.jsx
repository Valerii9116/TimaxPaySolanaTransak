import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SUPPORTED_CHAINS, SUPPORTED_ASSETS } from '../config';

const TerminalContext = createContext();

export const useTerminal = () => useContext(TerminalContext);

export const TerminalProvider = ({ children }) => {
  // --- START OF FIX: Corrected syntax for useState hook ---
  const [mode, setMode] = useState('ACCEPT_FIAT');
  // --- END OF FIX ---
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
    }
  }, [selectedChain]);

  const setAppStatus = (message, type = 'info') => {
    setStatus({ message, type });
  };

  const handleChainChange = (newChainIdOrName) => {
    const newChain = SUPPORTED_CHAINS.find(c => 
        String(c.id) === String(newChainIdOrName) || c.name === newChainIdOrName
    );
    if (newChain) {
        setSelectedChain(newChain);
        setAppStatus(`Switched to ${newChain.name} network.`);
    }
  };

  const value = useMemo(() => ({
    mode,
    setMode,
    status,
    setAppStatus,
    amount,
    setAmount,
    selectedChain,
    setSelectedChain: handleChainChange,
    selectedAsset,
    setSelectedAsset,
    availableAssets,
  }), [mode, status, amount, selectedChain, selectedAsset, availableAssets]);

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  );
};

TerminalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

