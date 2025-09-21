// FIXED PaymentTerminal.jsx - Enhanced mode switching and proper wallet handling
import React from 'react';
import { useTerminal } from '../providers/TerminalProvider';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import AcceptFiat from './modes/AcceptFiat';
import AcceptCrypto from './modes/AcceptCrypto';
import SendCrypto from './modes/SendCrypto';
import Bridge from './modes/Bridge';
import { default as WithdrawComponent } from './modes/Withdraw';
import AssetSelector from './AssetSelector';
import StatusMessage from './StatusMessage';

function PaymentTerminal() {
    const { mode, setMode, selectedChain, setAppStatus } = useTerminal();
    const { address: evmAddress, chainId: evmChainId, isConnected: isEvmConnected } = useAccount();
    const { publicKey: solanaPublicKey, disconnect: solanaDisconnect, connected: isSolanaConnected } = useSolanaWallet();
    const { disconnect: wagmiDisconnect } = useDisconnect();
    const { switchChain, isPending: isSwitching } = useSwitchChain();

    const merchantAddress = evmAddress || solanaPublicKey?.toBase58();
    const isWalletConnected = isEvmConnected || isSolanaConnected;
    const isWrongNetwork = isEvmConnected && evmChainId && selectedChain.id !== evmChainId;

    const handleDisconnect = () => {
        try {
            if (isEvmConnected) {
                wagmiDisconnect();
                setAppStatus('EVM wallet disconnected', 'info');
            } else if (isSolanaConnected) {
                solanaDisconnect();
                setAppStatus('Solana wallet disconnected', 'info');
            }
        } catch (error) {
            console.error('Disconnect error:', error);
            setAppStatus('Error disconnecting wallet', 'error');
        }
    };

    const handleNetworkSwitch = async () => {
        if (!isEvmConnected) return;
        
        try {
            setAppStatus('Switching network...', 'info');
            await switchChain({ chainId: selectedChain.id });
            setAppStatus(`Switched to ${selectedChain.name}`, 'success');
        } catch (error) {
            console.error('Network switch error:', error);
            setAppStatus(`Failed to switch to ${selectedChain.name}. Please switch manually.`, 'error');
        }
    };

    const renderTerminalContent = () => {
        if (!isWalletConnected) {
            return (
                <div className="wallet-required">
                    <p>Please connect your wallet to access payment features.</p>
                </div>
            );
        }

        switch (mode) {
            case 'ACCEPT_FIAT': 
                return <AcceptFiat merchantAddress={merchantAddress} />;
            case 'ACCEPT_CRYPTO': 
                return <AcceptCrypto merchantAddress={merchantAddress} />;
            case 'SEND': 
                return <SendCrypto merchantAddress={merchantAddress} />;
            case 'BRIDGE': 
                return <Bridge merchantAddress={merchantAddress} />;
            case 'WITHDRAW': 
                return <WithdrawComponent merchantAddress={merchantAddress} />;
            default: 
                return (
                    <div className="invalid-mode">
                        <p>Invalid mode selected. Please choose a valid payment option.</p>
                    </div>
                );
        }
    };

    return (
        <>
            {/* Wallet Info Card */}
            <div className="step-card">
                <div className="wallet-info-connected">
                    <div className="wallet-address-section">
                        <p className="wallet-address">
                            {merchantAddress ? 
                                `${merchantAddress.substring(0, 6)}...${merchantAddress.substring(merchantAddress.length - 4)}` : 
                                'Connecting...'
                            }
                        </p>
                        {isEvmConnected && (
                            <span className="network-badge">
                                {selectedChain.name}
                                {isWrongNetwork && <span className="wrong-network">⚠️</span>}
                            </span>
                        )}
                    </div>
                    <div className="wallet-actions">
                        {isWrongNetwork && (
                            <button 
                                className="switch-button-compact" 
                                onClick={handleNetworkSwitch}
                                disabled={isSwitching}
                            >
                                {isSwitching ? 'Switching...' : 'Switch Net'}
                            </button>
                        )}
                        <button onClick={handleDisconnect} className="disconnect-button-compact">
                            Disconnect
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Terminal Container */}
            <div className="payment-terminal-container">
                {/* Enhanced Terminal Tabs */}
                <div className="terminal-tabs">
                    <button 
                        onClick={() => setMode('ACCEPT_FIAT')} 
                        className={mode === 'ACCEPT_FIAT' ? 'active' : ''}
                        title="Accept fiat payments via Transak"
                    >
                        Accept Fiat
                    </button>
                    <button 
                        onClick={() => setMode('ACCEPT_CRYPTO')} 
                        className={mode === 'ACCEPT_CRYPTO' ? 'active' : ''}
                        title="Accept direct crypto payments"
                    >
                        Accept Crypto
                    </button>
                    <button 
                        onClick={() => setMode('SEND')} 
                        className={mode === 'SEND' ? 'active' : ''}
                        title="Send crypto to another address"
                    >
                        Send Crypto
                    </button>
                    <button 
                        onClick={() => setMode('BRIDGE')} 
                        className={mode === 'BRIDGE' ? 'active' : ''}
                        title="Bridge tokens across chains via LI.FI"
                    >
                        Bridge
                    </button>
                    <button 
                        onClick={() => setMode('WITHDRAW')} 
                        className={mode === 'WITHDRAW' ? 'active' : ''}
                        title="Withdraw crypto to bank account"
                    >
                        Withdraw
                    </button>
                </div>

                {/* Network and Asset Selectors */}
                <div className="network-selectors">
                    <AssetSelector />
                </div>

                {/* Status Messages */}
                <div className="main-status">
                    <StatusMessage />
                </div>
                
                {/* Wrong Network Warning */}
                {isWrongNetwork && (
                    <div className="network-warning">
                        <p className="error-message">
                            Wrong network detected. Please switch to {selectedChain.name} to continue.
                        </p>
                        <button 
                            onClick={handleNetworkSwitch} 
                            className="switch-network-button"
                            disabled={isSwitching}
                        >
                            {isSwitching ? 'Switching...' : `Switch to ${selectedChain.name}`}
                        </button>
                    </div>
                )}

                {/* Terminal Content */}
                <div className="terminal-content">
                    {renderTerminalContent()}
                </div>
            </div>
        </>
    );
}

export default PaymentTerminal;