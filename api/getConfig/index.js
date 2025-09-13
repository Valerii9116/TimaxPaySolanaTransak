module.exports = async function (context, req) {
    context.log('getConfig function processed a request.');
  
    try {
      const config = {
        walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID,
        transakApiKey: process.env.TRANSAK_API_KEY,
        transakEnvironment: process.env.TRANSAK_ENVIRONMENT || 'STAGING',
      };
  
      // Check if any required keys are missing
      if (!config.walletConnectProjectId || !config.transakApiKey) {
        const missingKeys = Object.entries(config)
          .filter(([key, value]) => !value)
          .map(([key]) => key);
        
        context.log.error(`Server configuration error. Missing keys: ${missingKeys.join(', ')}`);
        
        context.res = {
          status: 500,
          body: { error: `Server configuration error. The following required API keys are missing on the server: ${missingKeys.join(', ')}` }
        };
        return;
      }
  
      context.res = {
        status: 200,
        body: config,
      };
    } catch (error) {
      context.log.error('Error in getConfig function:', error);
      context.res = {
        status: 500,
        body: { error: "An unexpected server error occurred." },
      };
    }
  };
  