import React, { useCallback, useMemo } from 'react';
import { useWallet as useSolanaWalletHook } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWeb3Modal } from '@web3modal/wagmi/react';

const WalletConnector = () => {
  const { open: openWeb3Modal } = useWeb3Modal(); // For EVM wallets
  const { wallets, select, connecting, connected } = useSolanaWalletHook(); // For Solana
  const { setVisible: setSolanaModalVisible } = useWalletModal(); // For Solana modal

  // Filter wallets to remove duplicates and only show available ones
  const availableSolanaWallets = useMemo(() => {
    const walletMap = new Map();
    
    // Process all wallets and deduplicate by name
    wallets.forEach(wallet => {
      const name = wallet.adapter.name;
      
      // Skip if we already have this wallet or if it's not available
      if (walletMap.has(name)) return;
      
      // Only include wallets that are actually available
      if (wallet.readyState === 'Installed' || wallet.readyState === 'Loadable') {
        walletMap.set(name, wallet);
      }
    });
    
    return Array.from(walletMap.values());
  }, [wallets]);

  // Handle Solana wallet selection with proper error handling
  const handleSolanaWalletSelect = useCallback(async (walletName) => {
    if (connecting) return; // Prevent multiple connection attempts
    
    try {
      console.log('Attempting to connect to Solana wallet:', walletName);
      await select(walletName);
    } catch (error) {
      console.error('Failed to select Solana wallet:', error);
      // The error will be handled by the onError callback in WalletProvider
    }
  }, [select, connecting]);

  return (
    <div className="connect-container">
      <div className="header">
        <h1>Connect Your Wallet</h1>
        <p>Choose your preferred wallet to get started</p>
      </div>

      {/* EVM Wallets Section */}
      <h3 style={{textAlign: 'center', color: '#a0a0a0', marginBottom: '15px'}}>EVM Wallets</h3>
      <table className="wallet-table">
        <tbody>
          <tr className="wallet-row" onClick={() => openWeb3Modal()}>
            <td className="wallet-cell">
              <div className="wallet-info">
                <div className="wallet-details">
                  <h3>Browser & Mobile Wallets</h3>
                  <p>MetaMask, WalletConnect, Coinbase Wallet, etc.</p>
                </div>
              </div>
            </td>
            <td className="wallet-cell wallet-action">
              <button className="connect-btn">Connect EVM</button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Solana Wallets Section */}
      <h3 style={{textAlign: 'center', color: '#a0a0a0', margin: '30px 0 15px'}}>Solana Wallets</h3>
      
      {connecting && (
        <div style={{textAlign: 'center', marginBottom: '15px'}}>
          <p style={{color: 'var(--brand-primary)'}}>
            Connecting to wallet...
          </p>
        </div>
      )}

      <table className="wallet-table">
        <tbody>
          {availableSolanaWallets.length > 0 ? (
            availableSolanaWallets.map((wallet) => (
              <tr 
                key={`${wallet.adapter.name}-${wallet.adapter.url}`} // More unique key
                className="wallet-row" 
                onClick={() => handleSolanaWalletSelect(wallet.adapter.name)}
              >
                <td className="wallet-cell">
                  <div className="wallet-info">
                    <div className="wallet-icon-container">
                      <img 
                        src={wallet.adapter.icon} 
                        alt={`${wallet.adapter.name} logo`} 
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="wallet-details">
                      <h3>{wallet.adapter.name}</h3>
                      <p>
                        {wallet.readyState === 'Installed' 
                          ? 'Ready to connect' 
                          : wallet.readyState === 'Loadable'
                          ? 'Click to load'
                          : 'Not detected'
                        }
                      </p>
                    </div>
                  </div>
                </td>
                <td className="wallet-cell wallet-status">
                  <span className={`status-badge ${
                    wallet.readyState === 'Installed' 
                      ? 'status-available' 
                      : wallet.readyState === 'Loadable'
                      ? 'status-available'
                      : 'status-not-detected'
                  }`}>
                    {wallet.readyState === 'Installed' ? 'Available' : 
                     wallet.readyState === 'Loadable' ? 'Loadable' : 'Not detected'}
                  </span>
                </td>
                <td className="wallet-cell wallet-action">
                  <button 
                    className="connect-btn" 
                    style={{background: 'var(--brand-solana)'}}
                    disabled={connecting || (wallet.readyState !== 'Installed' && wallet.readyState !== 'Loadable')}
                  >
                    {connecting ? 'Connecting...' : 'Connect'}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="wallet-cell" colSpan="3" style={{textAlign: 'center', padding: '20px'}}>
                <p style={{color: '#a0a0a0', marginBottom: '10px'}}>
                  {connecting ? 'Loading wallets...' : 'No Solana wallets detected'}
                </p>
                {!connecting && (
                  <p style={{color: '#888', fontSize: '0.9em'}}>
                    Install Phantom, Solflare, or other Solana wallets to get started
                  </p>
                )}
              </td>
            </tr>
          )}
          
          {/* Show more options button - only if not connecting */}
          {!connecting && (
            <tr className="wallet-row" onClick={() => setSolanaModalVisible(true)}>
              <td className="wallet-cell" colSpan="3" style={{textAlign: 'center'}}>
                <p style={{color: '#a0a0a0'}}>Show All Solana Wallet Options...</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WalletConnector;