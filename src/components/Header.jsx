import React from 'react';
import { EVMWalletConnector } from './EVMWalletConnector';
import { SolanaWalletConnector } from './SolanaWalletConnector';
import { useTerminal } from '../providers/TerminalProvider';

export const Header = () => {
  const { selectedChain } = useTerminal();
  const isEVM = selectedChain.chainType !== 'SOLANA';

  return (
    <header>
      <h1>TimaxPay</h1>
      <div className="wallet-connector">
        {isEVM ? <EVMWalletConnector /> : <SolanaWalletConnector />}
      </div>
    </header>
  );
};