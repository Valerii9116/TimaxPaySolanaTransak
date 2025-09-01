import React, { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { STABLECOIN_ADDRESSES } from '../config';

function WalletConnector({ onConnect, selectedChain, selectedStablecoin }) {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const tokenAddress = STABLECOIN_ADDRESSES[selectedChain.id]?.[selectedStablecoin];

  const { data: balanceData, isLoading: isBalanceLoading, isError: isBalanceError } = useBalance({
    address: address,
    chainId: selectedChain.id,
    token: tokenAddress,
    enabled: isConnected && !!tokenAddress,
  });

  useEffect(() => {
    onConnect(address, chainId);
  }, [address, chainId, onConnect]);

  const isWrongNetwork = isConnected && chainId !== selectedChain.id;

  const renderBalance = () => {
    if (isWrongNetwork) return <span className="balance-info error">Wrong Network</span>;
    if (!tokenAddress) return <span className="balance-info">N/A on {selectedChain.name}</span>
    if (isBalanceLoading) return <span className="balance-info">Loading...</span>;
    if (isBalanceError || !balanceData) return <span className="balance-info error">Balance Error</span>;
    return (
      <span className="balance-info">
        {parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(2)} {balanceData.symbol}
      </span>
    );
  };

  const hasSpecificInjectedWallet = connectors.some(
    c => c.type === 'injected' && (c.name === 'MetaMask' || c.name === 'Coinbase Wallet')
  );

  const filteredConnectors = hasSpecificInjectedWallet
    ? connectors.filter(c => c.name !== 'Injected')
    : connectors;
  
  // Sort connectors to your preferred order
  const sortedConnectors = [...filteredConnectors].sort((a, b) => {
    const preferredOrder = ['MetaMask', 'WalletConnect', 'Coinbase Wallet', 'Browser Wallet'];
    const indexA = preferredOrder.indexOf(a.name);
    const indexB = preferredOrder.indexOf(b.name);
    
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  if (isConnected) {
    return (
      <div className="wallet-info-connected">
        <div className="wallet-address-balance">
            <p className="wallet-address">
              <strong>{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</strong>
            </p>
            <div className="balance-display">
              {renderBalance()}
            </div>
        </div>
        <div className="wallet-actions">
              {isWrongNetwork && (
                <button className="switch-button-compact" onClick={() => switchChain({ chainId: selectedChain.id })}>
                  Switch Network
                </button>
              )}
            <button onClick={() => disconnect()} className="disconnect-button-compact">Disconnect</button>
        </div>
      </div>
    );
  }

  return (
    <div className="connect-container">
        <h3>Connect a Wallet</h3>
        {/* Redesigned text-only button list */}
        <div className="wallet-text-list">
            {sortedConnectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                className="wallet-text-button"
              >
                {connector.name === 'Injected' ? 'Browser Wallet' : connector.name}
              </button>
            ))}
        </div>
      {error && <p className="error-message">{error.message}</p>}
    </div>
  );
}

export default WalletConnector;

