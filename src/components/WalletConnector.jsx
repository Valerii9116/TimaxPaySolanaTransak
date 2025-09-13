import React from 'react';
// --- START OF FIX: Separated imports to their correct packages ---
import { useWallet as useSolanaWalletHook } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
// --- END OF FIX ---
import { useWeb3Modal } from '@web3modal/wagmi/react';

const WalletConnector = () => {
    const { open: openWeb3Modal } = useWeb3Modal(); // For EVM wallets
    const { wallets, select } = useSolanaWalletHook(); // For Solana
    const { setVisible: setSolanaModalVisible } = useWalletModal(); // For Solana modal

    const installedSolanaWallets = wallets.filter(w => w.readyState === 'Installed');

    return (
        <div className="connect-container">
            <div className="header">
                <h1>Connect Your Wallet</h1>
                <p>Choose your preferred wallet to get started</p>
            </div>
            
            <h3 style={{textAlign: 'center', color: '#a0a0a0', marginBottom: '15px'}}>EVM Wallets</h3>
            <table className="wallet-table">
                <tbody>
                    {/* This single, stable button opens the Web3Modal with all EVM options */}
                    <tr className="wallet-row" onClick={() => openWeb3Modal()}>
                        <td className="wallet-cell">
                            <div className="wallet-info">
                                <div className="wallet-details"><h3>Browser & Mobile Wallets</h3></div>
                            </div>
                        </td>
                        <td className="wallet-cell wallet-action">
                            <button className="connect-btn">Connect EVM</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <h3 style={{textAlign: 'center', color: '#a0a0a0', margin: '30px 0 15px'}}>Solana Wallets</h3>
             <table className="wallet-table">
                <tbody>
                    {installedSolanaWallets.map((wallet) => (
                        <tr key={wallet.adapter.name} className="wallet-row" onClick={() => select(wallet.adapter.name)}>
                             <td className="wallet-cell">
                                <div className="wallet-info">
                                    <div className="wallet-icon-container"><img src={wallet.adapter.icon} alt={`${wallet.adapter.name} logo`} /></div>
                                    <div className="wallet-details"><h3>{wallet.adapter.name}</h3></div>
                                </div>
                            </td>
                            <td className="wallet-cell wallet-action">
                                <button className="connect-btn" style={{background: 'var(--brand-solana)'}}>Connect</button>
                            </td>
                        </tr>
                    ))}
                     <tr className="wallet-row" onClick={() => setSolanaModalVisible(true)}>
                        <td className="wallet-cell" colSpan="2" style={{textAlign: 'center'}}>
                           <p style={{color: '#a0a0a0'}}>Show More Options...</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default WalletConnector;

