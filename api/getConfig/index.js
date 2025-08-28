module.exports = async function (context, req) {
  context.log('--- getConfig function started ---');

  const transakApiKey = process.env.TRANSAK_API_KEY;
  const walletConnectProjectId = process.env.WALLETCONNECT_PROJECT_ID;
  const transakEnvironment = process.env.TRANSAK_ENVIRONMENT;

  // Log the values the server sees (or doesn't see)
  context.log(`Found TRANSAK_API_KEY: ${transakApiKey ? 'Yes, starting with ' + transakApiKey.substring(0, 5) : 'No'}`);
  context.log(`Found WALLETCONNECT_PROJECT_ID: ${walletConnectProjectId ? 'Yes' : 'No'}`);
  context.log(`Found TRANSAK_ENVIRONMENT: ${transakEnvironment ? transakEnvironment : 'No'}`);

  const config = {
    transakApiKey: transakApiKey,
    walletConnectProjectId: walletConnectProjectId,
    transakEnvironment: transakEnvironment,
  };

  if (config.transakApiKey && config.walletConnectProjectId && config.transakEnvironment) {
    context.log('All configurations found. Sending success response.');
    context.res = {
      status: 200,
      body: config,
      headers: { 'Content-Type': 'application/json' }
    };
  } else {
    context.log.error("CRITICAL ERROR: One or more required environment variables are missing.");
    context.res = {
      status: 500,
      body: { error: "Server configuration is incomplete. Required keys are missing." },
      headers: { 'Content-Type': 'application/json' }
    };
  }
  context.log('--- getConfig function finished ---');
};
