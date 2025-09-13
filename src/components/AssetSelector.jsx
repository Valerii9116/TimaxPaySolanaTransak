import React from 'react';
import { useTerminal } from '../providers/TerminalProvider';
// --- START OF FIX: Ensured correct import name ---
import { SUPPORTED_CHAINS, SUPPORTED_ASSETS } from '../config';
// --- END OF FIX ---

export default function AssetSelector() {
  const { 
    selectedChain, 
    setSelectedChain, 
    selectedAsset, 
    setSelectedAsset,
  } = useTerminal();

  // Filter assets based on the selected chain's type (EVM or SOLANA)
  const availableAssets = SUPPORTED_ASSETS.filter(asset => {
    if (selectedChain.chainType === 'SOLANA') {
      return asset.chainType === 'SOLANA' || asset.chainType === 'BOTH';
    } else { // EVM
      return asset.chainType === 'EVM' || asset.chainType === 'BOTH';
    }
  });

  return (
    <>
      <div className="selector-group">
        <label htmlFor="network-select">Network</label>
        <select id="network-select" value={selectedChain.id} onChange={(e) => setSelectedChain(e.target.value)}>
          {SUPPORTED_CHAINS.map(chain => (
            <option key={chain.id} value={chain.id}>{chain.name}</option>
          ))}
        </select>
      </div>
      <div className="selector-group">
        <label htmlFor="stablecoin-select">Crypto</label>
        <select id="stablecoin-select" value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)} disabled={availableAssets.length === 0}>
          {availableAssets.length > 0 ? availableAssets.map(coin => (
            <option key={coin.symbol} value={coin.symbol}>{coin.symbol}</option>
          )) : <option>Not Available</option>}
        </select>
      </div>
    </>
  );
}

