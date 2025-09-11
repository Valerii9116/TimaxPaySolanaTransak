const axios = require('axios');

// This is your original file, with the URL markdown error corrected.
module.exports = async function (context, req) {
    context.log('getTransactions function processed a request.');

    const { environment, apiKey } = req.body;
    if (!apiKey || !environment) {
        context.res = { status: 400, body: "Missing apiKey or environment" };
        return;
    }
    
    // FIX: Removed incorrect markdown from the URLs
    const baseUrl = environment === 'PRODUCTION'
        ? 'https://api.transak.com/v2'
        : 'https://api-staging.transak.com/v2';
    
    try {
        const response = await axios.get(`${baseUrl}/orders`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        context.res = { status: 200, body: response.data };
    } catch (error) {
        context.log.error('Transak API call failed:', error.response ? error.response.data : error.message);
        context.res = {
            status: error.response ? error.response.status : 500,
            body: error.response ? error.response.data : { message: "An internal server error occurred." }
        };
    }
};

