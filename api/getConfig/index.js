module.exports = async function (context, req) {
    context.log('getConfig function processed a request.');
  
    try {
      const config = {
        walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID,
        transakApiKey: process.env.TRANSAK_API_KEY,
        // Add other public-facing keys here
      };
  
      if (!config.walletConnectProjectId || !config.transakApiKey) {
        context.log.error('Missing required environment variables.');
        context.res = {
          status: 500,
          body: { error: "Server configuration error. Required API keys are missing." }
        };
        return;
      }
  
      context.res = {
        status: 200,
        body: { data: config },
      };
    } catch (error) {
      context.log.error('Error in getConfig function:', error);
      context.res = {
        status: 500,
        body: { error: "An unexpected error occurred." },
      };
    }
  };