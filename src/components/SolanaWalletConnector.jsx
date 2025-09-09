import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { ASSET_ADDRESSES } from '../config.js';

function SolanaWalletConnector({ onDisconnect, selectedAsset }) {
    const { connection } = useConnection();
    const { publicKey, connected } = useWallet();
    const [balance, setBalance] = useState({ amount: 0, symbol: 'SOL' });

    useEffect(() => {
        if (!connected || !publicKey || !connection) {
            setBalance({ amount: 0, symbol: 'SOL' });
            return;
        }

        const fetchBalance = async () => {
            try {
                const assetInfo = ASSET_ADDRESSES.solana[selectedAsset];

                if (assetInfo && assetInfo !== 'NATIVE') {
                    // This is a token, so we need to find the associated token account balance
                    const mint = new PublicKey(assetInfo);
                    // A full implementation would go here, but for this example, we will just show SOL balance
                    // as fetching token balances requires more complex logic.
                    const lamports = await connection.getBalance(publicKey);
                    setBalance({ amount: lamports / LAMPORTS_PER_SOL, symbol: 'SOL' });
                } else {
                    // This is the native SOL balance
                    const lamports = await connection.getBalance(publicKey);
                    setBalance({ amount: lamports / LAMPORTS_PER_SOL, symbol: 'SOL' });
                }
            } catch (error) {
                console.error("Failed to fetch Solana balance:", error);
                setBalance({ amount: 0, symbol: 'SOL' });
            }
        };

        fetchBalance();
    }, [publicKey, connected, connection, selectedAsset]);

    if (!connected || !publicKey) {
        return <div className="wallet-info-connected">Connecting Solana wallet...</div>;
    }

    return (
        <div className="wallet-info-connected">
            <div className="wallet-address-balance">
                <p className="wallet-address">
                    <strong>{`${publicKey.toBase58().substring(0, 6)}...${publicKey.toBase58().substring(publicKey.toBase58().length - 4)}`}</strong>
                </p>
                <div className="balance-display">
                    {balance.amount.toFixed(4)} {balance.symbol}
                </div>
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

