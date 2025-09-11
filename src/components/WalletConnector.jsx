import React from 'react';

// This component displays information about the currently connected wallet
// and provides a button to disconnect.
function WalletConnector({ wallet, onDisconnect }) {
    if (!wallet) return null;

    const shortAddress = `${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}`;

    return (
        <div className="wallet-connector">
            <p className="wallet-address">
                {shortAddress}
            </p>
            <button onClick={onDisconnect} className="disconnect-button">
                Disconnect
            </button>
        </div>
    );
}

export default WalletConnector;
