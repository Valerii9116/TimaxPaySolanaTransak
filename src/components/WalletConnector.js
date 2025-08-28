import React, { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi';

const POLYGON_CHAIN_ID = 137;

function WalletConnector({ onConnect }) {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: address,
    token: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC on Polygon
    chainId: POLYGON_CHAIN_ID,
    enabled: isConnected && chain?.id === POLYGON_CHAIN_ID,
  });

  useEffect(() => {
    if (isConnected && address) {
      onConnect(address, chain?.id);
    } else {
      onConnect(null, null);
    }
  }, [isConnected, address, chain, onConnect]);

  const isWrongNetwork = isConnected && chain?.id !== POLYGON_CHAIN_ID;

  if (isConnected) {
    return (
      <div className="wallet-connector">
        <div className="wallet-info">
          <div>
            <p className="wallet-address-label">Merchant Wallet:</p>
            <p className="wallet-address"><strong>{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</strong></p>
          </div>
          <div className="balance-display">
            <p className="balance-label">USDC Balance (Polygon)</p>
            <p className="balance-value">{isWrongNetwork ? 'N/A' : (isBalanceLoading ? '...' : parseFloat(balanceData?.formatted || '0').toFixed(2))}</p>
          </div>
        </div>
        <div className="connection-controls">
          {isWrongNetwork && (
            <button onClick={() => switchChain({ chainId: POLYGON_CHAIN_ID })} className="switch-network-button">
              Switch to Polygon
            </button>
          )}
          <button onClick={() => disconnect()} className="disconnect-button">Disconnect</button>
        </div>
      </div>
    );
  }

  return (
    <div className="connection-controls">
      {connectors.map((connector) => (
        <button key={connector.uid} onClick={() => connect({ connector })} className="connect-button">{`Connect ${connector.name}`}</button>
      ))}
    </div>
  );
}
export default WalletConnector;