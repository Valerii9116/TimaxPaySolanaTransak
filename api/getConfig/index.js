module.exports = async function (context, req) {
  const config = {
    transakApiKey: process.env.TRANSAK_API_KEY,
    walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID,
  };

  if (config.transakApiKey && config.walletConnectProjectId) {
    context.res = {
      status: 200,
      body: config,
      headers: { 'Content-Type': 'application/json' }
    };
  } else {
    context.log.error("API keys are not set in application settings.");
    context.res = {
      status: 500,
      body: { error: "Server configuration is incomplete." },
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
