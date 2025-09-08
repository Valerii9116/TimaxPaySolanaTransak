const axios = require('axios');

async function getTransakAccessToken(apiKey, apiSecret, apiUrl) {
  const url = `${apiUrl}/partners/api/v2/refresh-token`;
  try {
    const response = await axios.post(url, { apiKey }, {
      headers: { 'api-secret': apiSecret }
    });
    return response.data.data.accessToken;
  } catch (error) {
    const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
    throw new Error(`Failed to refresh Transak token: ${errorDetails}`);
  }
}

module.exports = async function (context, req) {
  // ** THE FIX IS HERE **
  // Gracefully handle requests that are missing a body, which can occur during
  // the Azure build and deployment process.
  if (!req.body) {
    context.res = {
        status: 400,
        body: { error: "Request body is missing. This endpoint requires a POST request." }
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
    const transakApiUrl = (process.env.TRANSAK_ENVIRONMENT === 'STAGING') 
      ? 'https://api-stg.transak.com' 
      : 'https://api.transak.com';

    if (!apiKey || !apiSecret) {
      throw new Error("API credentials are not configured in application settings.");
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
