import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

import './App.css';
import { SUPPORTED_CHAINS } from './config.js';

import EVMWalletConnector from './components/EVMWalletConnector.jsx';
import SolanaWalletConnector from './components/SolanaWalletConnector.jsx';
import PaymentTerminal from './components/PaymentTerminal.jsx';

const EvmIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l-6 10.5L12 22l6-10.5L12 2z" /><path d="M6 12.5l6-10.5 6 10.5" /><path d="M6 12.5l6 9.5 6-9.5" /></svg> );
const SolanaIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 100 100"><path fill="#00FFA3" d="M38.86 31.08c-3.1-4.48-8.23-7.23-13.88-7.23-10.22 0-18.5 8.28-18.5 18.5s8.28 18.5 18.5 18.5c5.65 0 10.78-2.75 13.88-7.23l22.28-3.07c3.1 4.48 8.23 7.23 13.88 7.23 10.22 0 18.5-8.28 18.5-18.5s-8.28-18.5-18.5-18.5c-5.65 0-10.78 2.75-13.88 7.23L38.86 31.08zM16.48 42.35c0-4.65 3.77-8.42 8.42-8.42s8.42 3.77 8.42 8.42-3.77 8.42-8.42 8.42-8.42-3.77-8.42-8.42zm58.6 0c0-4.65 3.77-8.42 8.42-8.42s8.42 3.77 8.42 8.42-3.77 8.42-8.42 8.42-8.42-3.77-8.42-8.42z" /></svg> );

function WalletSelection() {
  const { open: openEvmModal } = useWeb3Modal();
  const { setVisible: setSolanaModalVisible } = useWalletModal();
  return (
    <div className="wallet-selection-card step-card">
      <h2>Connect Wallet</h2>
      <p className="subtitle">Select your preferred ecosystem to begin</p>
      <div className="wallet-buttons-container">
        <button className="wallet-button" onClick={() => openEvmModal()}>
          <EvmIcon />
          <span>EVM Wallets</span>
        </button>
        <button className="wallet-button solana" onClick={() => setSolanaModalVisible(true)}>
          <SolanaIcon />
          <span>Solana Wallets</span>
        </button>
      </div>
    </div>
  );
}

function App({ transakApiKey, transakEnvironment }) {
  const [status, setStatus] = useState('');
  const [merchantAddress, setMerchantAddress] = useState(null);
  const [connectedChain, setConnectedChain] = useState(null);
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
  const [selectedAsset, setSelectedAsset] = useState('ETH');
  const { address: evmAddress, chainId: evmChainId, isConnected: isEvmConnected } = useAccount();
  const { disconnect: disconnectEVM } = useDisconnect();
  const { publicKey: solanaPublicKey, connected: isSolanaConnected, disconnect: disconnectSolana } = useWallet();

  useEffect(() => {
    if (isEvmConnected && evmAddress) {
      setMerchantAddress(evmAddress);
      setConnectedChain({ chainType: 'EVM', chainId: evmChainId });
      if (isSolanaConnected) disconnectSolana().catch(console.error);
    } 
    else if (isSolanaConnected && solanaPublicKey) {
      setMerchantAddress(solanaPublicKey.toBase58());
      setConnectedChain({ chainType: 'SOLANA' });
      const solanaChain = SUPPORTED_CHAINS.find(c => c.chainType === 'SOLANA');
      if (solanaChain) setSelectedChain(solanaChain);
      if (isEvmConnected) disconnectEVM();
    }
    else {
      setMerchantAddress(null);
      setConnectedChain(null);
    }
  }, [isEvmConnected, evmAddress, evmChainId, isSolanaConnected, solanaPublicKey, disconnectEVM, disconnectSolana]);

  const handleDisconnect = () => {
    if (connectedChain?.chainType === 'EVM') disconnectEVM();
    if (connectedChain?.chainType === 'SOLANA') disconnectSolana().catch(console.error);
  };

  const isWrongNetwork = connectedChain?.chainType === 'EVM' && connectedChain.chainId !== selectedChain.id;

  return (
    <div className="app-container">
      <header className="App-header">
        <h1>TimaxPay Merch Terminal</h1>
        <p className="subtitle">Accept & Send Crypto on EVM + Solana</p>
      </header>
      {!merchantAddress ? (
        <WalletSelection />
      ) : (
        <>
          <div className="step-card">
            {connectedChain?.chainType === 'EVM' 
              ? <EVMWalletConnector onDisconnect={handleDisconnect} selectedChain={selectedChain} selectedAsset={selectedAsset} />
              : <SolanaWalletConnector onDisconnect={handleDisconnect} />
            }
          </div>
          {isWrongNetwork && <p className="error-message">Wrong network. Please switch in your wallet.</p>}
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
        </>
      )}
      {status && <p className="status-message">{status}</p>}
    </div>
  );
}

export default App;

