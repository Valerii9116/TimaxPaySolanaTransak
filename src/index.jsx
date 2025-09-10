import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals.js';
import WalletAdapters from './WalletAdapters.jsx';

// Required for Solana Wallet UI styling
import '@solana/wallet-adapter-react-ui/styles.css';

// Global error handler for debugging wallet connection issues
// This helps catch silent errors from wallet libraries.
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

const StatusDisplay = ({ message }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'sans-serif',
        padding: '2rem',
        color: 'white',
        textAlign: 'center'
    }}>
        {message}
    </div>
);

const initializeApp = async () => {
    const container = document.getElementById('root');
    if (!container) return;
    const root = createRoot(container);
    root.render(<StatusDisplay message="Initializing Terminal..." />);

    try {
        const response = await fetch('/api/getConfig');
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API Error: ${response.statusText} (Status: ${response.status}). Response: ${errorBody}`);
        }
        
        const serverConfig = await response.json();
        if (!serverConfig.walletConnectProjectId) {
            throw new Error('Crucial Error: WalletConnect Project ID is missing from server config. EVM wallets cannot function.');
        }

        root.render(
            <React.StrictMode>
                <WalletAdapters serverConfig={serverConfig}>
                    <App transakApiKey={serverConfig.transakApiKey} transakEnvironment={serverConfig.transakEnvironment} />
                </WalletAdapters>
            </React.StrictMode>
        );

    } catch (error) {
        console.error("Fatal Initialization Failed:", error);
        root.render(<StatusDisplay message={`Error: ${error.message}. Please verify API server is running and proxied correctly.`} />);
    }
};

initializeApp();
reportWebVitals();

