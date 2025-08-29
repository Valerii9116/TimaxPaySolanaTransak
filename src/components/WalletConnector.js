import React, { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useBalance } from 'wagmi';
import { walletConnect } from 'wagmi/connectors';
import { formatUnits } from 'viem';

const getAssetConfig = (chainId) => {
    switch (chainId) {
        case 137: // Polygon
            return { name: "Polygon", symbol: "USDC", address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6 };
        case 1: // Ethereum
            return { name: "Ethereum", symbol: "USDC", address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 };
        case 42161: // Arbitrum
            return { name: "Arbitrum", symbol: "USDC", address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 };
        case 59144: // Linea
            return { name: "Linea", symbol: "USDC", address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', decimals: 6 };
        case 43114: // Avalanche
            return { name: "Avalanche", symbol: "USDC", address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6 };
        default:
            return null;
    }
};


function WalletConnector({ onConnect }) {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const assetConfig = getAssetConfig(chainId);

  const { data: balanceData, isLoading: isBalanceLoading, isError: isBalanceError } = useBalance({
    address: address,
    chainId: chainId,
    token: assetConfig?.address,
    enabled: isConnected && !!assetConfig,
  });

  useEffect(() => {
    onConnect(address, chainId);
  }, [address, chainId, onConnect]);

  const renderBalance = () => {
    if (!isConnected) return null;
    if (!assetConfig) return <span className="balance-info error">Unsupported Network</span>;
    if (isBalanceLoading) return <span className="balance-info">Loading Balance...</span>;
    if (isBalanceError || !balanceData) return <span className="balance-info error">Balance Error</span>;
    return (
      <span className="balance-info">
        {assetConfig.name} Balance: {parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(2)} {assetConfig.symbol}
      </span>
    );
  };

  if (isConnected) {
    return (
      <div className="wallet-info">
        <p>
          Connected: <strong>{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</strong>
        </p>
        <div className="balance-container">
          {renderBalance()}
        </div>
        <button onClick={() => disconnect()} className="disconnect-button">Disconnect</button>
      </div>
    );
  }

  return (
    <div className="connect-container">
      <button onClick={() => connect({ connector: walletConnect() })} className="connect-button">
        Connect Wallet
      </button>
    </div>
  );
}

export default WalletConnector;
