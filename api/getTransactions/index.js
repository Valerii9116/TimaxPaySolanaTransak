const axios = require('axios');

/**
 * Refreshes the Transak access token using the API key and secret.
 */
async function getTransakAccessToken(apiKey, apiSecret, apiUrl) {
  const url = `${apiUrl}/partners/api/v2/refresh-token`;
  try {
    const response = await axios.post(url, { apiKey }, {
      headers: { 'api-secret': apiSecret }
    });
    if (response.data && response.data.data && response.data.data.accessToken) {
        return response.data.data.accessToken;
    }
    throw new Error('Access token not found in Transak response.');
  } catch (error) {
    const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
    // Log the detailed error for debugging on the server
    console.error(`Failed to refresh Transak token: ${errorDetails}`);
    throw new Error(`Failed to refresh Transak token.`);
  }
}

module.exports = async function (context, req) {
  if (!req.body) {
    context.res = {
        status: 400,
        body: { error: "Request body is missing." }
    };
    return;
  }

  const { partnerCustomerId } = req.body;
  if (!partnerCustomerId) {
    context.res = { status: 400, body: { error: "partnerCustomerId is required." }};
    return;
  }

  try {
    const apiKey = process.env.TRANSAK_API_KEY;
    const apiSecret = process.env.TRANSAK_API_SECRET;
    const transakEnvironment = process.env.TRANSAK_ENVIRONMENT;

    // FIX: Removed invalid Markdown links from the URL strings.
    const transakApiUrl = (transakEnvironment === 'STAGING') 
       ? 'https://api-stg.transak.com' 
       : 'https://api.transak.com';

    if (!apiKey || !apiSecret) {
      context.log.error("API credentials are not configured in application settings.");
      throw new Error("Server API credentials are not configured.");
    }

    const accessToken = await getTransakAccessToken(apiKey, apiSecret, transakApiUrl);
    
    const products = encodeURIComponent(JSON.stringify(["BUY", "SELL"]));
    const ordersUrl = `${transakApiUrl}/partners/api/v2/orders?filter[partnerCustomerId]=${encodeURIComponent(partnerCustomerId)}&filter[productsAvailed]=${products}`;

    const ordersResponse = await axios.get(ordersUrl, {
      headers: { 'access-token': accessToken }
    });
    
    context.res = {
      status: 200,
      body: ordersResponse.data.data,
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    context.log.error("Error in getTransactions:", error.message);
    context.res = {
      status: 500,
      body: { error: `An error occurred: ${error.message}` },
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
