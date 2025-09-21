import React from 'react';
// import { useTerminal } from '../providers/TerminalProvider'; // This import is mocked below to resolve the build error.

// --- Mock Implementation to Resolve Compilation Error ---
// In a real project, this mock would be removed, and the real import above would be used.
const useTerminal = () => ({
  supportedChains: [
    { id: 1, name: 'Ethereum', chainType: 'EVM' },
    { id: 137, name: 'Polygon', chainType: 'EVM' },
    { id: 'solana', name: 'Solana', chainType: 'SOLANA' },
  ],
  selectedChain: { id: 1, name: 'Ethereum', chainType: 'EVM' },
  setSelectedChain: (id) => console.log(`Chain changed to: ${id}`),
  selectedAsset: 'ETH',
  setSelectedAsset: (asset) => console.log(`Asset changed to: ${asset}`),
  availableAssets: [
    { symbol: 'ETH', chainType: 'EVM' },
    { symbol: 'USDC', chainType: 'BOTH' },
    { symbol: 'MATIC', chainType: 'EVM' }
  ],
});
// --- End of Mock ---


export default function AssetSelector() {
  const { 
    supportedChains,
    selectedChain, 
    setSelectedChain, 
    selectedAsset, 
    setSelectedAsset,
    availableAssets,
  } = useTerminal();

  return (
    <>
      <div className="selector-group">
        <label htmlFor="network-select">Network</label>
        <select 
          id="network-select" 
          value={selectedChain.id} 
          onChange={(e) => setSelectedChain(e.target.value)}
        >
          {supportedChains.map(chain => (
            <option key={chain.id} value={chain.id}>{chain.name}</option>
          ))}
        </select>
      </div>
      <div className="selector-group">
        <label htmlFor="asset-select">Crypto</label>
        <select 
          id="asset-select" 
          value={selectedAsset} 
          onChange={(e) => setSelectedAsset(e.target.value)} 
          disabled={availableAssets.length === 0}
        >
          {availableAssets.length > 0 ? availableAssets.map(coin => (
            <option key={coin.symbol} value={coin.symbol}>{coin.symbol}</option>
          )) : <option>Not Available</option>}
        </select>
      </div>
    </>
  );
}

