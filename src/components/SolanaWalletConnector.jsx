import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

function SolanaWalletConnector({ onDisconnect }) {
    const { publicKey, connected } = useWallet();

    if (!connected || !publicKey) {
        return <div className="wallet-info-connected">Connecting Solana wallet...</div>;
    }

    return (
        <div className="wallet-info-connected">
            <div className="wallet-address-balance">
                <p className="wallet-address">
                    <strong>{`${publicKey.toBase58().substring(0, 6)}...${publicKey.toBase58().substring(publicKey.toBase58().length - 4)}`}</strong>
                </p>
            </div>
            <div className="wallet-actions">
                <button onClick={onDisconnect} className="disconnect-button-compact">
                    Disconnect
                </button>
            </div>
        </div>
    );
}

export default SolanaWalletConnector;

