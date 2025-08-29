import React, { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useBalance } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { formatUnits } from 'viem';

const polygonChainId = 137;
const USDC_POLYGON_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';

function WalletConnector({ onConnect }) {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const { data: balanceData, isLoading: isBalanceLoading, isError: isBalanceError } = useBalance({
    address: address,
    chainId: polygonChainId,
    token: USDC_POLYGON_ADDRESS,
    enabled: isConnected && currentChainId === polygonChainId,
  });

  useEffect(() => {
    onConnect(address, chainId);
  }, [address, chainId, onConnect]);

  const isWrongNetwork = isConnected && currentChainId !== polygonChainId;

  const renderBalance = () => {
    if (isWrongNetwork) return <span className="balance-info error">Wrong Network</span>;
    if (isBalanceLoading) return <span className="balance-info">Loading...</span>;
    if (isBalanceError || !balanceData) return <span className="balance-info error">Error</span>;
    return (
      <span className="balance-info">
        Balance: {parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(2)} USDC (Polygon)
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
          {isWrongNetwork && (
            <button className="switch-button" onClick={() => switchChain({ chainId: polygonChainId })}>
              Switch to Polygon
            </button>
          )}
        </div>
        <button onClick={() => disconnect()} className="disconnect-button">Disconnect</button>
      </div>
    );
  }

  return (
    <div className="connect-container">
      <button onClick={() => connect({ connector: injected() })} className="connect-button">
        Connect (Browser)
      </button>
      <button onClick={() => connect({ connector: walletConnect() })} className="connect-button">
        Connect (Mobile)
      </button>
    </div>
  );
}

export default WalletConnector;
