import React from 'react';
import PropTypes from 'prop-types';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useTerminal } from '../providers/TerminalProvider';
import { useWalletBalance } from '../hooks/useWalletBalance';
import ConnectedWalletInfo from './ConnectedWalletInfo';
import { Sparkles } from 'lucide-react';

const SolanaWalletConnector = ({ onDisconnect }) => {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const { selectedChain, selectedAsset } = useTerminal();
  
  const { balance, isLoading: isBalanceLoading } = useWalletBalance(null, publicKey, selectedChain, selectedAsset);

  const handleDisconnect = () => {
    disconnect();
    onDisconnect();
  };

  if (connecting) {
    return (
      <div className="step-card">
        <p style={{ textAlign: 'center' }}>Connecting...</p>
      </div>
    );
  }

  if (connected && publicKey) {
    return (
      <div className="wallet-info-card">
        <ConnectedWalletInfo
          address={publicKey.toBase58()}
          onDisconnect={handleDisconnect}
          networkStatus="ok" // Solana has only one network in this app
          balance={balance}
          isBalanceLoading={isBalanceLoading}
        />
      </div>
    );
  }

  return (
    <div className="step-card wallet-selection-card">
      <div className="wallet-buttons-container">
        <button className="wallet-button solana" onClick={() => setVisible(true)}>
          <Sparkles size={22} />
          <span>Connect Solana Wallet</span>
        </button>
      </div>
    </div>
  );
};

SolanaWalletConnector.propTypes = {
  onDisconnect: PropTypes.func.isRequired,
};

export default SolanaWalletConnector;

