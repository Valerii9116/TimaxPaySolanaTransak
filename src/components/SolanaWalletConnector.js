import React, { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function SolanaWalletConnector({ onConnect }) {
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    onConnect(publicKey ? publicKey.toBase58() : null);
  }, [publicKey, connected, onConnect]);

  return <WalletMultiButton />;
}

export default SolanaWalletConnector;

