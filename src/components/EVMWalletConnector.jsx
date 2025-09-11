import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

function EVMWalletConnector() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();

  const truncateAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (isConnected && address) {
    return (
      <div className="wallet-info">
        <span>EVM: {truncateAddress(address)}</span>
        <button onClick={() => disconnect()} className="disconnect-button">Disconnect</button>
      </div>
    );
  }

  return <button onClick={() => open()} className="connect-button">Connect EVM Wallet</button>;
}

export default EVMWalletConnector;

