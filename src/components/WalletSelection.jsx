import React from 'react';

// Icons for the selection buttons
const EvmIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l-6 10.5L12 22l6-10.5L12 2z" /><path d="M6 12.5l6-10.5 6 10.5" /><path d="M6 12.5l6 9.5 6-9.5" /></svg> );
const SolanaIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 100 100" fill="currentColor"><path d="M38.86 31.08c-3.1-4.48-8.23-7.23-13.88-7.23-10.22 0-18.5 8.28-18.5 18.5s8.28 18.5 18.5 18.5c5.65 0 10.78-2.75 13.88-7.23l22.28-3.07c3.1 4.48 8.23 7.23 13.88 7.23 10.22 0 18.5-8.28 18.5-18.5s-8.28-18.5-18.5-18.5c-5.65 0-10.78 2.75-13.88 7.23L38.86 31.08zM16.48 42.35c0-4.65 3.77-8.42 8.42-8.42s8.42 3.77 8.42 8.42-3.77 8.42-8.42 8.42-8.42-3.77-8.42-8.42zm58.6 0c0-4.65 3.77-8.42 8.42-8.42s8.42 3.77 8.42 8.42-3.77 8.42-8.42 8.42-8.42-3.77-8.42-8.42z" /></svg> );

// This component presents the initial choice between wallet ecosystems.
const WalletSelection = ({ onConnect }) => {
    return (
        <div className="wallet-selection-card">
            <h2>Connect Your Wallet</h2>
            <p className="subtitle">Select your preferred ecosystem to begin.</p>
            <div className="wallet-buttons-container">
                <button className="wallet-button evm" onClick={() => onConnect('EVM')}>
                    <EvmIcon />
                    <span>EVM & Partners</span>
                </button>
                <button className="wallet-button solana" onClick={() => onConnect('SOLANA')}>
                    <SolanaIcon />
                    <span>Solana</span>
                </button>
            </div>
        </div>
    );
};

export default WalletSelection;
