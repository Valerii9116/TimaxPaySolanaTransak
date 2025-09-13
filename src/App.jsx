import React from 'react';
import { useAccount as useWagmiAccount } from 'wagmi';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import WalletConnector from './components/WalletConnector';
import PaymentTerminal from './components/PaymentTerminal';
import { TerminalProvider } from './providers/TerminalProvider';

function App() {
  const { isConnected: isEvmConnected, address: evmAddress } = useWagmiAccount();
  const { connected: isSolanaConnected, publicKey: solanaPublicKey } = useSolanaWallet();

  const isWalletConnected = isEvmConnected || isSolanaConnected;
  
  // --- START OF FIX: Corrected the typo from 'toBase5a' to 'toBase58' ---
  const walletIdentifier = evmAddress || (solanaPublicKey ? solanaPublicKey.toBase58() : undefined);
  // --- END OF FIX ---

  return (
    // The key prop ensures the TerminalProvider and its state resets when the wallet connects or disconnects.
    <TerminalProvider key={walletIdentifier}>
      <div className="app-container">
        <header className="App-header">
          <h1>TimaxPay Merchant Terminal</h1>
          <p className="subtitle">Accept Fiat & Crypto Payments with Ease</p>
        </header>
        <main>
          {isWalletConnected ? (
            <PaymentTerminal />
          ) : (
            <div className="step-card" style={{padding: '25px'}}>
              <WalletConnector />
            </div>
          )}
        </main>
      </div>
    </TerminalProvider>
  );
}

export default App;

