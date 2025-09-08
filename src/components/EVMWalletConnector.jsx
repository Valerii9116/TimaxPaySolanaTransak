import React from 'react';
import { useAccount, useSwitchChain, useBalance } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { formatUnits } from 'viem';

import { ASSET_ADDRESSES } from '../config.js';

function EVMWalletConnector({ onDisconnect, selectedChain, selectedAsset }) {
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  
  const tokenAddress = ASSET_ADDRESSES[selectedChain.id]?.[selectedAsset];
  const isNativeAsset = tokenAddress === 'NATIVE';

  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address,
    chainId: selectedChain.id,
    token: isNativeAsset ? undefined : tokenAddress,
    enabled: isConnected && !!tokenAddress,
  });

  const isWrongNetwork = isConnected && chainId !== selectedChain.id;

  const renderBalance = () => {
    if (isWrongNetwork) return <span className="balance-info error">Wrong Network</span>;
    if (isBalanceLoading) return <span>Loading...</span>;
    if (!balanceData) return <span>-</span>;
    return <span>{parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)} {balanceData.symbol}</span>;
  };

  return (
    <div className="wallet-info-connected">
      <div className="wallet-address-balance">
          <p className="wallet-address">
            <strong>{address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Connecting...'}</strong>
          </p>
          <div className="balance-display">
              {renderBalance()}
          </div>
      </div>
      <div className="wallet-actions">
        {isWrongNetwork && (
          <button className="switch-button-compact" onClick={() => switchChain({ chainId: selectedChain.id })}>
            Switch
          </button>
        )}
        <button onClick={() => open({ view: 'Account' })} className="account-button-compact">
          Account
        </button>
        <button onClick={onDisconnect} className="disconnect-button-compact">
          Disconnect
        </button>
      </div>
    </div>
  );
}

export default EVMWalletConnector;

