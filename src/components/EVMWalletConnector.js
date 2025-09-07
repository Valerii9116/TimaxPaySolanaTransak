import React, { useEffect } from 'react';
import { useAccount, useSwitchChain, useBalance } from 'wagmi';
// Correct the import path for the useWeb3Modal hook
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { formatUnits } from 'viem';

// --- CONFIG ---
import { ASSET_ADDRESSES } from '../config';

function EVMWalletConnector({ onConnect, selectedChain, selectedAsset }) {
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  
  // Get token address for balance check, handle native assets
  const tokenAddress = ASSET_ADDRESSES[selectedChain.id]?.[selectedAsset];
  const isNativeAsset = tokenAddress === 'NATIVE';

  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address,
    chainId: selectedChain.id,
    // Only provide a token address if it's not the native asset
    token: isNativeAsset ? undefined : tokenAddress,
    // Only enable the query if the user is connected and a token address exists
    enabled: isConnected && !!tokenAddress,
  });
  
  useEffect(() => {
    onConnect(address, chainId);
  }, [address, chainId, onConnect]);

  const isWrongNetwork = isConnected && chainId !== selectedChain.id;

  const renderBalance = () => {
    if (isWrongNetwork) return <span className="balance-info error">Wrong Network</span>;
    if (isBalanceLoading) return <span>Loading...</span>;
    if (!balanceData) return <span>-</span>;
    return <span>{parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)} {balanceData.symbol}</span>;
  };

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
        <div>
          {isWrongNetwork && (
            <button className="switch-button-compact" onClick={() => switchChain({ chainId: selectedChain.id })}>
              Switch
            </button>
          )}
          <button onClick={() => open({ view: 'Account' })} className="disconnect-button-compact">
            Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => open()} className="launch-button">
      Connect EVM Wallet
    </button>
  );
}

export default EVMWalletConnector;

