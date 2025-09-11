import React from 'react';

function AssetSelector({ selectedAsset, setSelectedAsset, evmChains, solanaChains }) {
  return (
    <div className="asset-selector">
      <label htmlFor="asset-select">Select Asset:</label>
      <select
        id="asset-select"
        value={selectedAsset}
        onChange={(e) => setSelectedAsset(e.target.value)}
      >
        <optgroup label="Solana">
          {solanaChains.map((chain) => (
            <option key={chain.symbol} value={chain.symbol}>
              {chain.name} ({chain.symbol})
            </option>
          ))}
        </optgroup>
        <optgroup label="EVM">
          {evmChains.map((chain) => (
            <option key={chain.symbol} value={chain.symbol}>
              {chain.name} ({chain.symbol})
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}

export default AssetSelector;

