import React, { useState, useEffect } from 'react';
import { useDisconnect } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';

// --- STYLES & CONFIG ---
import './App.css';
import { SUPPORTED_CHAINS } from './config';

// --- COMPONENTS ---
import EVMWalletConnector from './components/EVMWalletConnector';
import SolanaWalletConnector from './components/SolanaWalletConnector';
import PaymentTerminal from './components/PaymentTerminal';

function App({ transakApiKey, transakEnvironment }) {
  const [status, setStatus] = useState('');
  const [merchantAddress, setMerchantAddress] = useState(null);
  const [connectedChain, setConnectedChain] = useState(null);
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
  const [selectedAsset, setSelectedAsset] = useState('ETH');

  const { disconnect: disconnectEVM } = useDisconnect();
  const { disconnect: disconnectSolana, connected: isSolanaConnected } = useWallet();

  useEffect(() => {
    if (selectedChain.chainType === 'SOLANA' && connectedChain?.chainType === 'EVM') {
      disconnectEVM();
      setMerchantAddress(null);
      setConnectedChain(null);
    }
    if (selectedChain.chainType === 'EVM' && isSolanaConnected) {
      disconnectSolana().catch(e => console.error("Solana disconnect failed", e));
      setMerchantAddress(null);
      setConnectedChain(null);
    }
  }, [selectedChain, connectedChain, isSolanaConnected, disconnectEVM, disconnectSolana]);


  const handleEvmConnect = (address, chainId) => {
    if (selectedChain.chainType === 'EVM') {
      setMerchantAddress(address);
      setConnectedChain(address ? { chainType: 'EVM', chainId: chainId } : null);
    }
  };

  const handleSolanaConnect = (address) => {
    if (selectedChain.chainType === 'SOLANA') {
      setMerchantAddress(address);
      setConnectedChain(address ? { chainType: 'SOLANA' } : null);
    }
  };

  const isWrongNetwork = connectedChain?.chainType === 'EVM' && connectedChain.chainId !== selectedChain.id;

  return (
    <div className="app-container">
      <header className="App-header">
        <h1>TimaxPay Terminal</h1>
        <p className="subtitle">Accept & Send Crypto on EVM + Solana</p>
      </header>
      <div className="step-card">
        {selectedChain.chainType === 'EVM'
          ? <EVMWalletConnector onConnect={handleEvmConnect} selectedChain={selectedChain} selectedAsset={selectedAsset} />
          : <SolanaWalletConnector onConnect={handleSolanaConnect} />
        }
      </div>
      {isWrongNetwork && <p className="error-message">Wrong network. Please switch in your wallet.</p>}
      {merchantAddress && (
        <PaymentTerminal
          apiKey={transakApiKey}
          environment={transakEnvironment}
          merchantAddress={merchantAddress}
          setStatus={setStatus}
          selectedChain={selectedChain}
          setSelectedChain={setSelectedChain}
          selectedAsset={selectedAsset}
          setSelectedAsset={setSelectedAsset}
          isInteractionDisabled={isWrongNetwork}
        />
      )}
      {status && <p className="status-message">{status}</p>}
    </div>
  );
}

export default App;

