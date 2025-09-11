// This Azure Function securely provides environment variables to the frontend.
// It prevents your secret API keys from being exposed in the client-side code.
module.exports = async function (context, req) {
    context.log('getConfig function processed a request.');

    const config = {
        walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID,
        transakApiKey: process.env.TRANSAK_API_KEY,
        transakEnvironment: process.env.TRANSAK_ENVIRONMENT || 'STAGING' // Default to STAGING
    };

    // Essential check to ensure the backend is configured correctly.
    if (!config.walletConnectProjectId || !config.transakApiKey) {
        context.res = {
            status: 500,
            body: { error: "Server configuration is incomplete. Required API keys (WalletConnect, Transak) are missing from environment variables." }
        };
        return;
    }

    context.res = {
        // Successfully return the configuration
        body: config
    };
};
