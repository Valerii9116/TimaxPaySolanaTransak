import React, { useState, useMemo } from 'react';
import { useSwitchChain } from 'wagmi';
import Transak from '@transak/transak-sdk';
import QRCode from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import QrScanner from './QrScanner';
import { SUPPORTED_CHAINS, SUPPORTED_ASSETS } from '../config';

// Main component for handling payments after a wallet is connected.
function PaymentTerminal({ appConfig, wallet }) {
    const [mode, setMode] = useState('ACCEPT_CRYPTO'); // Default mode
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [status, setStatus] = useState({ message: '', type: '' });
    const [isScanning, setIsScanning] = useState(false);

    // Filter chains and assets based on the connected wallet's ecosystem
    const availableChains = useMemo(() =>
        SUPPORTED_CHAINS.filter(c => c.chainType === wallet.type),
        [wallet.type]
    );

    const availableAssets = useMemo(() =>
        SUPPORTED_ASSETS.filter(a => a.chainType === wallet.type || a.chainType === 'BOTH'),
        [wallet.type]
    );
    
    // Set initial chain and asset, or update if they become invalid
    const [selectedChain, setSelectedChain] = useState(availableChains[0]);
    const [selectedAsset, setSelectedAsset] = useState(availableAssets.find(a => a.symbol === 'USDC') || availableAssets[0]);

    const { switchChain } = useSwitchChain();
    const isWrongNetwork = wallet.type === 'EVM' && wallet.chainId !== selectedChain.id;

    // --- Handlers ---
    const handleNetworkChange = (e) => {
        const newChain = SUPPORTED_CHAINS.find(c => String(c.id) === e.target.value);
        if (newChain) {
            setSelectedChain(newChain);
            if (wallet.type === 'EVM' && wallet.chainId !== newChain.id) {
                switchChain({ chainId: newChain.id });
            }
        }
    };

    const handleCopy = () => {
        setStatus({ message: 'Address copied to clipboard!', type: 'status' });
        setTimeout(() => setStatus({ message: '', type: '' }), 2000);
    };

    const handleQrScanSuccess = (decodedText) => {
        setRecipient(decodedText);
        setIsScanning(false);
        setStatus({ message: 'Address scanned successfully!', type: 'status' });
        setTimeout(() => setStatus({ message: '', type: '' }), 2000);
    };

    const launchTransak = () => {
        const transak = new Transak({
            apiKey: appConfig.transakApiKey,
            environment: appConfig.transakEnvironment,
            walletAddress: wallet.address,
            // Add other configuration as needed
        });
        transak.init();
    };

    // --- Render Logic ---
    const renderTerminalBody = () => {
        switch (mode) {
            case 'ACCEPT_CRYPTO':
                return (
                    <div className="text-center">
                        <p className="mb-2">Receive {selectedAsset.name} on {selectedChain.name}</p>
                        <div className="qr-code-container">
                             <QRCode value={wallet.address} size={160} />
                        </div>
                        <div className="address-display">
                           <span>{wallet.address}</span>
                           <CopyToClipboard text={wallet.address} onCopy={handleCopy}>
                               <button title="Copy Address">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                               </button>
                           </CopyToClipboard>
                        </div>
                    </div>
                );
            case 'SEND_CRYPTO':
                 return (
                    <div>
                        <div className="selector-group mb-2">
                           <label htmlFor="recipient-address">Recipient Address</label>
                           <div className="d-flex align-center gap-1">
                             <input id="recipient-address" type="text" className="input-field" placeholder="0x... or Solana address" value={recipient} onChange={e => setRecipient(e.target.value)} />
                             <button className="icon-button" title="Scan QR Code" onClick={() => setIsScanning(true)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>
                             </button>
                           </div>
                        </div>
                         <div className="selector-group mb-2">
                           <label htmlFor="amount">Amount</label>
                           <input id="amount" type="number" className="input-field" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                        </div>
                        <button className="action-button mt-1" disabled={isWrongNetwork}>Send {selectedAsset.name}</button>
                    </div>
                );
            case 'ACCEPT_FIAT':
                return (
                     <div className="text-center">
                        <p className="mb-2">Use our partner Transak to accept fiat payments directly to your wallet.</p>
                        <button onClick={launchTransak} className="action-button" disabled={isWrongNetwork}>
                            Launch Fiat On-Ramp
                        </button>
                    </div>
                );
            default:
                return <p className="text-center mt-2">This feature is coming soon.</p>;
        }
    };
    
    return (
        <div className="payment-terminal-container">
             {isScanning && <QrScanner onSuccess={handleQrScanSuccess} onCancel={() => setIsScanning(false)} />}
            <div className="terminal-tabs">
                <button onClick={() => setMode('ACCEPT_CRYPTO')} className={mode === 'ACCEPT_CRYPTO' ? 'active' : ''}>Accept Crypto</button>
                <button onClick={() => setMode('SEND_CRYPTO')} className={mode === 'SEND_CRYPTO' ? 'active' : ''}>Send Crypto</button>
                <button onClick={() => setMode('ACCEPT_FIAT')} className={mode === 'ACCEPT_FIAT' ? 'active' : ''}>Accept Fiat</button>
                <button onClick={() => setMode('WITHDRAW')} className={mode === 'WITHDRAW' ? 'active' : ''}>Withdraw</button>
            </div>

            {isWrongNetwork && (
                <div className="message-box network-warning mb-2">
                    Wrong Network. Please switch to {selectedChain.name}.
                </div>
            )}
            
            {status.message && (
                <div className={`message-box ${status.type === 'error' ? 'error-message' : 'status-message'} mb-2`}>
                    {status.message}
                </div>
            )}

            <div className="network-selectors">
                <div className="selector-group">
                    <label htmlFor="network-select">Network</label>
                    <select id="network-select" value={selectedChain.id} onChange={handleNetworkChange} disabled={availableChains.length <= 1}>
                        {availableChains.map(chain => (
                            <option key={chain.id} value={chain.id}>{chain.name}</option>
                        ))}
                    </select>
                </div>
                <div className="selector-group">
                    <label htmlFor="asset-select">Asset</label>
                    <select id="asset-select" value={selectedAsset.symbol} onChange={(e) => setSelectedAsset(availableAssets.find(a => a.symbol === e.target.value))}>
                        {availableAssets.map(asset => (
                            <option key={asset.symbol} value={asset.symbol}>{asset.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="terminal-body">
                {renderTerminalBody()}
            </div>
        </div>
    );
}

export default PaymentTerminal;
