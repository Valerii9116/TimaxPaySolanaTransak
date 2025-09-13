import React from 'react';
import PropTypes from 'prop-types';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { useTerminal } from '../providers/TerminalProvider';
import { useWalletBalance } from '../hooks/useWalletBalance';
import ConnectedWalletInfo from './ConnectedWalletInfo';
import { Wallet, QrCode, Link } from 'lucide-react';

const EVMWalletManager = ({ onDisconnect }) => {
  const { open } = useWeb3Modal();
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { selectedChain, selectedAsset } = useTerminal();
  const currentChainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  
  const { balance, isLoading: isBalanceLoading } = useWalletBalance(address, null, selectedChain, selectedAsset);

  const networkStatus = isConnected && currentChainId !== selectedChain.id ? 'mismatch' : 'ok';

  const handleDisconnect = () => {
    disconnect();
    onDisconnect();
  };
  
  if (isConnecting) {
    return (
      <div className="step-card">
        <p style={{ textAlign: 'center' }}>Connecting wallet...</p>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="wallet-info-card">
        <ConnectedWalletInfo
          address={address}
          onDisconnect={handleDisconnect}
          networkStatus={networkStatus}
          onSwitchNetwork={() => switchChain({ chainId: selectedChain.id })}
          networkName={selectedChain.name}
          isSwitching={isSwitching}
          balance={balance}
          isBalanceLoading={isBalanceLoading}
        />
        {networkStatus === 'mismatch' && (
          <div className="network-warning">
            <div className="error-message">
              Wrong network. Please switch to {selectedChain.name}.
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- START OF UI UPDATE ---
  return (
    <div className="step-card wallet-selection-card">
      <h2>Connect an EVM Wallet</h2>
      <p className="subtitle" style={{marginTop: '10px', fontSize: '0.9em'}}>Use browser extensions, WalletConnect QR code, or mobile deep links.</p>
      <div className="wallet-buttons-container">
        <button className="wallet-button" onClick={() => open()}>
          <Wallet size={22} />
          <span>Open Connection Options</span>
        </button>
      </div>
    </div>
  );
  // --- END OF UI UPDATE ---
};

EVMWalletManager.propTypes = {
  onDisconnect: PropTypes.func.isRequired,
};

export default EVMWalletManager;

