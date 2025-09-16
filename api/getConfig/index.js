// This file is a temporary version for testing purposes only.
// The configuration values are hardcoded to diagnose deployment issues.
// DO NOT use this code in a production environment.

module.exports = async function (context, req) {
  context.log('getConfig function processed a request on Azure.');

  try {
    // --- START OF TEMPORARY HARDCODED CONFIG FOR TESTING ---
    const config = {
      walletConnectProjectId: "dc14d146c0227704322ac9a46aaed7cd",
      transakApiKey: "0fedc8c1-38db-455e-8792-8e8174bead31",
      transakEnvironment: "STAGING",
    };
    // --- END OF TEMPORARY HARDCODED CONFIG FOR TESTING ---

    // The rest of the logic is the same
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
