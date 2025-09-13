import React from 'react';
import { useTerminal } from '../providers/TerminalProvider';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import AcceptFiat from './modes/AcceptFiat';
import AcceptCrypto from './modes/AcceptCrypto';
import SendCrypto from './modes/SendCrypto';
import { default as WithdrawComponent } from './modes/Withdraw';
import AssetSelector from './AssetSelector'; // Corrected import
import StatusMessage from './StatusMessage'; // Corrected import

function PaymentTerminal() {
    const { mode, setMode, selectedChain } = useTerminal();
    const { address: evmAddress, chainId: evmChainId } = useAccount();
    const { publicKey: solanaPublicKey, disconnect: solanaDisconnect } = useSolanaWallet();
    const { disconnect: wagmiDisconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();

    const merchantAddress = evmAddress || solanaPublicKey?.toBase58();
    const isEVM = !!evmAddress;
    const isWrongNetwork = isEVM && evmChainId && selectedChain.id !== evmChainId;

    const handleDisconnect = () => {
        if (isEVM) {
            wagmiDisconnect();
        } else {
            solanaDisconnect();
        }
    };

    const renderTerminalContent = () => {
        switch (mode) {
            case 'ACCEPT_FIAT': return <AcceptFiat merchantAddress={merchantAddress} />;
            case 'ACCEPT_CRYPTO': return <AcceptCrypto merchantAddress={merchantAddress} />;
            case 'SEND': return <SendCrypto />;
            case 'WITHDRAW': return <WithdrawComponent merchantAddress={merchantAddress} />;
            default: return null;
        }
    };

    return (
        <>
            <div className="step-card">
                 <div className="wallet-info-connected">
                    <p className="wallet-address">{merchantAddress ? `${merchantAddress.substring(0, 6)}...${merchantAddress.substring(merchantAddress.length - 4)}` : 'Connecting...'}</p>
                    <div className="wallet-actions">
                        {isWrongNetwork && <button className="switch-button-compact" onClick={() => switchChain({ chainId: selectedChain.id })}>Switch Net</button>}
                        <button onClick={handleDisconnect} className="disconnect-button-compact">Disconnect</button>
                    </div>
                </div>
            </div>

            <div className="payment-terminal-container">
                <div className="terminal-tabs">
                    <button onClick={() => setMode('ACCEPT_FIAT')} className={mode === 'ACCEPT_FIAT' ? 'active' : ''}>Accept Fiat</button>
                    <button onClick={() => setMode('ACCEPT_CRYPTO')} className={mode === 'ACCEPT_CRYPTO' ? 'active' : ''}>Accept Crypto</button>
                    <button onClick={() => setMode('SEND')} className={mode === 'SEND' ? 'active' : ''}>Send Crypto</button>
                    <button onClick={() => setMode('WITHDRAW')} className={mode === 'WITHDRAW' ? 'active' : ''}>Withdraw</button>
                </div>

                <div className="network-selectors">
                    <AssetSelector />
                </div>

                <div className="main-status">
                    <StatusMessage />
                </div>
                
                {isWrongNetwork ? (
                     <div className="network-warning">
                        <p className="error-message">Please switch to {selectedChain.name} in your wallet to continue.</p>
                    </div>
                ) : renderTerminalContent()}
            </div>
        </>
    );
}

export default PaymentTerminal;

