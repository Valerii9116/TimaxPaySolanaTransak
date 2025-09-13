const axios = require('axios');

module.exports = async function (context, req) {
    context.log('getTransactions function processed a request.');

    const walletAddress = req.query.walletAddress;

    if (!walletAddress) {
        context.res = {
            status: 400,
            body: { error: "walletAddress query parameter is required." }
        };
        return;
    }

    const TRANSAK_API_SECRET = process.env.TRANSAK_API_SECRET;
    const TRANSAK_API_KEY = process.env.TRANSAK_API_KEY;
    const IS_STAGING = process.env.TRANSAK_ENVIRONMENT === 'STAGING';
    const API_URL = IS_STAGING 
        ? 'https://api-staging.transak.com/api/v2/orders' 
        : 'https://api.transak.com/api/v2/orders';

    if (!TRANSAK_API_SECRET || !TRANSAK_API_KEY) {
        context.log.error('Transak API secret or key is not configured.');
        context.res = {
            status: 500,
            body: { error: "Server configuration error." }
        };
        return;
    }

    try {
        const response = await axios.get(API_URL, {
            headers: {
                'transak-api-key': TRANSAK_API_KEY,
                'secret': TRANSAK_API_SECRET,
            },
            params: {
                'filter[walletAddress]': walletAddress,
                'limit': 100
            }
        });

        context.res = {
            status: 200,
            body: { data: response.data.data }
        };

    } catch (error) {
        context.log.error('Error fetching transactions from Transak:', error.response ? error.response.data : error.message);
        context.res = {
            status: error.response ? error.response.status : 500,
            body: { error: "Failed to fetch transactions from Transak." }
        };
    }
};