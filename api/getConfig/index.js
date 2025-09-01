module.exports = async function (context, req) {
  context.log('GetConfig function processed a request.');

  // These values should be set in your Azure Static Web App's "Configuration" (Environment Variables)
  const walletConnectProjectId = process.env.WALLETCONNECT_PROJECT_ID;
  const transakApiKey = process.env.TRANSAK_API_KEY;
  const transakEnvironment = process.env.TRANSAK_ENVIRONMENT;

  if (!walletConnectProjectId || !transakApiKey || !transakEnvironment) {
      context.res = {
          status: 500,
          body: "Server configuration is incomplete. Required API keys are missing."
      };
      return;
  }

  context.res = {
      // status: 200, /* Defaults to 200 */
      body: {
          walletConnectProjectId,
          transakApiKey,
          transakEnvironment
      }
  };
}

