// This file is the Azure Function that serves configuration to the frontend.
// It retrieves sensitive keys from environment variables configured in the Azure Portal.

module.exports = async function (context, req) {
  context.log('getConfig function processed a request on Azure.');

  try {
    const config = {
      walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID,
      transakApiKey: process.env.TRANSAK_API_KEY,
      transakEnvironment: process.env.TRANSAK_ENVIRONMENT || 'STAGING',
    };

    // Check if any required keys are missing on the server
    if (!config.walletConnectProjectId || !config.transakApiKey) {
      const missingKeys = Object.entries(config)
        .filter(([, value]) => !value)
        .map(([key]) => key);

      const errorMessage = `Server configuration error. The following required keys are missing in the Azure application settings: ${missingKeys.join(', ')}`;
      context.log.error(errorMessage);

      context.res = {
        status: 500,
        body: { error: errorMessage }
      };
      return;
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: config,
    };
    context.log('Server configuration loaded successfully.');

  } catch (error) {
    context.log.error('An unexpected error occurred in the getConfig function:', error);
    context.res = {
      status: 500,
      body: { error: "An unexpected server error occurred while loading configuration." },
    };
  }
};
