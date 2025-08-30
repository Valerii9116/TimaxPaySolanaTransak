import React, { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance } from 'wagmi';
import { formatUnits } from 'viem';

const polygonChainId = 137;
const USDC_POLYGON_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';

// SVG Icons for Wallets
const MetamaskIcon = () => (
  <svg width="40" height="40" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M252.333 99.333V55.667L128.5 2.667L4.667 55.667v43.666l58.666 24.667v54.667l-32 16v29.333h194v-29.333l-32-16v-54.667l58.666-24.667z" fill="#E2761B"></path><path d="M252.333 99.333l-50.666 21.334l-9-3.334l-14.667-12l-42.667 18v-43.334l-16-6.666V51l-36.667-15.333L4.667 55.667v43.666l58.666 24.667l-26 10.667V154l-16 8l16 7.333v10l32-16v-55.333l-32-13.333l-31.333-13.334v-31.333l123.833-52l123.833 52v31.333l-16 6.667z" fill="#E4761B"></path><path d="m181.333 118.667l12 5.333l-12 11.333l12 4l-12 5.334V158l32 16v-44.667l-32-13.333v-17.333z" fill="#233447"></path><path d="m74.667 118.667l-12 5.333l12 11.333l-12 4l12 5.334V158l-32 16v-44.667l32-13.333v-17.333z" fill="#233447"></path><path d="M128.5 142.667l-26.667-10.668l-21.333-28l21.333-4l26.667-11.333l26.667 11.333l21.333 4l-21.333 28l-26.667 10.668z" fill="#D7C1B3"></path><path d="M128.5 142.667V88.667l26.667 11.333l21.333 4l-21.333 28l-26.667 10.667z" fill="#E4C8B6"></path><path d="M102.5 108.667L81.167 112.667l12 10.666l9.333-14.666z" fill="#233447"></path><path d="M154.5 108.667L175.833 112.667l-12 10.666l-9.333-14.666z" fill="#233447"></path><path d="M128.5 132l-12.667 10l12.667 4.667l12.667-4.667l-12.667-10z" fill="#464646"></path><path d="m128.5 132l-12.667 10v-10.667L128.5 128l12.667 3.333V142l-12.667-10z" fill="#3C3C3C"></path><path d="m146.5 104.667l-18-2.668l-18 2.668l9.333 16l-9.333 1.333l-2.667 10.667L128.5 132l20.667-1.333l-2.667-10.667l-9.333-1.333l9.333-16z" fill="#F6851B"></path><path d="M128.5 102l18 2.667l-9.333 16l9.333 1.333l2.667 10.667L128.5 132V102z" fill="#E4751F"></path></svg>
);
const CoinbaseIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#2A63E0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/><path fill="#FFFFFF" d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
);
const WalletConnectIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#3B99FC" d="M4.5 12.5C4.5 11.67 5.17 11 6 11h1.5v2H6c-.83 0-1.5-.67-1.5-1.5zM12 4.5C8.41 4.5 5.5 7.41 5.5 11v2c0 3.59 2.91 6.5 6.5 6.5s6.5-2.91 6.5-6.5v-2C18.5 7.41 15.59 4.5 12 4.5zM12 18c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/><path fill="#3B99FC" d="M16.5 11H18c.83 0 1.5.67 1.5 1.5S18.83 14 18 14h-1.5v-3z"/></svg>
);
const GenericWalletIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 6h16v2H4V6zm10 9H4v-2h10v2zm6 0h-4v-2h4v2z"/></svg>
)

// Helper to get wallet details
const getWalletDetails = (connector) => {
  switch (connector.name) {
    case 'MetaMask':
      return { name: 'MetaMask', icon: <MetamaskIcon /> };
    case 'Coinbase Wallet':
      return { name: 'Coinbase Wallet', icon: <CoinbaseIcon /> };
    case 'WalletConnect':
      return { name: 'WalletConnect', icon: <WalletConnectIcon /> };
    case 'Injected':
      return { name: 'Browser Wallet', icon: <GenericWalletIcon /> };
    default:
      return { name: connector.name, icon: <GenericWalletIcon /> };
  }
};


function WalletConnector({ onConnect }) {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const { data: balanceData, isLoading: isBalanceLoading, isError: isBalanceError } = useBalance({
    address: address,
    chainId: polygonChainId,
    token: USDC_POLYGON_ADDRESS,
    enabled: isConnected && chainId === polygonChainId,
  });

  useEffect(() => {
    onConnect(address, chainId);
  }, [address, chainId, onConnect]);

  const isWrongNetwork = isConnected && chainId !== polygonChainId;

  const renderBalance = () => {
    if (isWrongNetwork) return <span className="balance-info error">Wrong Network</span>;
    if (isBalanceLoading) return <span className="balance-info">Loading...</span>;
    if (isBalanceError || !balanceData) return <span className="balance-info error">Balance Error</span>;
    return (
      <span className="balance-info">
        Balance: {parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(2)} USDC
      </span>
    );
  };

  if (isConnected) {
    return (
      <div className="wallet-info">
        <p>
          Connected: <strong>{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</strong>
        </p>
        <div className="balance-container">
          {renderBalance()}
          {isWrongNetwork && (
            <button className="switch-button" onClick={() => switchChain({ chainId: polygonChainId })}>
              Switch to Polygon
            </button>
          )}
        </div>
        <button onClick={() => disconnect()} className="disconnect-button">Disconnect</button>
      </div>
    );
  }

  return (
    <div className="connect-container">
        <h3>Connect Wallet</h3>
        <div className="wallet-list">
            {connectors.map((connector) => {
                const { name, icon } = getWalletDetails(connector);
                return (
                    <button
                        key={connector.uid}
                        onClick={() => connect({ connector })}
                        className="wallet-option"
                    >
                        {icon}
                        <span>{name}</span>
                    </button>
                )
            })}
        </div>
      {error && <p className="error-message">{error.message}</p>}
    </div>
  );
}

export default WalletConnector;


