import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '/src/App.jsx';
import Web3Provider from '/src/Web3Provider.jsx';
import './index.css';

// A component to show while fetching essential configuration from the backend.
const StatusDisplay = ({ message, isError = false }) => (
    <div className="loading-container">
        <div className="loading-content">
            {isError ? (
                <>
                    <h2 style={{ color: '#EF4444' }}>Initialization Error</h2>
                    <p>{message}</p>
                </>
            ) : (
                <>
                    <div className="loading-spinner"></div>
                    <p>{message}</p>
                </>
            )}
        </div>
    </div>
);

// This function safely initializes the application.
const initializeApp = async () => {
    const container = document.getElementById('root');
    if (!container) {
        console.error("Fatal Error: Root container not found.");
        return;
    }
    const root = createRoot(container);

    // Render a loading state immediately.
    root.render(<StatusDisplay message="Initializing Terminal..." />);

    try {
        // Fetch API keys from the secure backend endpoint.
        const response = await fetch('/api/getConfig');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
            throw new Error(`API connection failed (Status: ${response.status}). ${errorData.error || 'Ensure the API is running.'}`);
        }

        const serverConfig = await response.json();
        if (!serverConfig.walletConnectProjectId || !serverConfig.transakApiKey) {
            throw new Error('Server configuration is incomplete. Check backend environment variables.');
        }

        // Once config is ready, render the main application.
        root.render(
            <React.StrictMode>
                <Web3Provider serverConfig={serverConfig}>
                    <App serverConfig={serverConfig} />
                </Web3Provider>
            </React.StrictMode>
        );
    } catch (error) {
        console.error("Fatal Initialization Error:", error);
        root.render(<StatusDisplay message={error.message} isError={true} />);
    }
};

initializeApp();

