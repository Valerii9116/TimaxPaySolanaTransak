import React from 'react';
import PropTypes from 'prop-types';
import { Wallet, Sparkles } from 'lucide-react';

const WalletSelector = ({ onSelectWalletType }) => {
  return (
    <div className="step-card wallet-selection-card">
      <h2>Connect a Wallet to Get Started</h2>
      <div className="wallet-buttons-container">
        <button className="wallet-button" onClick={() => onSelectWalletType('EVM')}>
          <Wallet size={22} />
          <span>Connect EVM Wallet</span>
        </button>
        <button className="wallet-button solana" onClick={() => onSelectWalletType('SOLANA')}>
          <Sparkles size={22} />
          <span>Connect Solana Wallet</span>
        </button>
      </div>
    </div>
  );
};

WalletSelector.propTypes = {
  onSelectWalletType: PropTypes.func.isRequired,
};

export default WalletSelector;

