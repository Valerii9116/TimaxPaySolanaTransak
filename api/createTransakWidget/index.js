// CORRECTED api/createTransakWidget/index.js
// Your implementation has several issues that need fixing

const axios = require('axios');

module.exports = async function (context, req) {
    context.log('createTransakWidget function processed a request.');

    const TRANSAK_API_SECRET = process.env.TRANSAK_API_SECRET;
    const TRANSAK_API_KEY = process.env.TRANSAK_API_KEY;
    const TRANSAK_ENVIRONMENT = process.env.TRANSAK_ENVIRONMENT || 'STAGING';
    const REFERRER_DOMAIN = process.env.REFERRER_DOMAIN || 'merch.timaxpay.com';
    
    if (!TRANSAK_API_SECRET || !TRANSAK_API_KEY) {
        context.log.error('Transak API secret or key is not configured.');
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' }, // Added missing headers
            body: { 
                success: false, // Added success field for consistency
                error: "Server configuration error - Missing API credentials" 
            }
        };
        return;
    }

    if (!req.body || typeof req.body !== 'object') {
        context.res = {
            status: 400,
            headers: { 'Content-Type': 'application/json' }, // Added missing headers
            body: { 
                success: false, // Added success field
                error: "Widget configuration is required in request body." 
            }
        };
        return;
    }

    // FIXED: Use correct API endpoints (your URL was wrong)
    const API_ENDPOINTS = {
        STAGING: 'https://api-staging.transak.com/api/v2/partners/widget-url',
        PRODUCTION: 'https://api.transak.com/api/v2/partners/widget-url'
    };
    
    const API_URL = API_ENDPOINTS[TRANSAK_ENVIRONMENT.toUpperCase()] || API_ENDPOINTS.STAGING;
    
    context.log(`Using API URL: ${API_URL}`);
    context.log(`Environment: ${TRANSAK_ENVIRONMENT}`);
    context.log(`Referrer Domain: ${REFERRER_DOMAIN}`);

    try {
        // FIXED: Prepare widget config with required referrerDomain
        const widgetConfig = {
            // Core API parameters
            apiKey: TRANSAK_API_KEY,
            environment: TRANSAK_ENVIRONMENT,
            
            // CRITICAL: Add referrerDomain for your domain
            referrerDomain: REFERRER_DOMAIN,
            
            // User provided configuration
            ...req.body,
            
            // Security parameter (FIXED: goes in body, not headers)
            partnerApiSecret: TRANSAK_API_SECRET,
            
            // Domain URLs
            hostURL: `https://${REFERRER_DOMAIN}`,
            redirectURL: req.body.redirectURL || `https://${REFERRER_DOMAIN}/`,
        };

        // Remove undefined values to clean the payload
        Object.keys(widgetConfig).forEach(key => {
            if (widgetConfig[key] === undefined) {
                delete widgetConfig[key];
            }
        });

        context.log('Creating Transak widget URL with config:', JSON.stringify(widgetConfig, null, 2));

        // FIXED: Correct API call (API key and secret go in BODY, not headers)
        const response = await axios.post(API_URL, widgetConfig, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
                // REMOVED: api-key and api-secret from headers (they go in body)
            },
            timeout: 15000 // Added timeout
        });

        // Validate response structure
        if (!response.data || !response.data.data || !response.data.data.url) {
            context.log.error('Invalid API response structure:', response.data);
            throw new Error('Invalid response structure from Transak API - missing URL');
        }

        const widgetUrl = response.data.data.url;
        const sessionId = response.data.data.sessionId || null;

        context.log('Widget URL created successfully');
        context.log('Session ID:', sessionId);

        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { 
                success: true,
                widgetUrl,
                sessionId, // Include session ID for tracking
                referrerDomain: REFERRER_DOMAIN, // Include for verification
                environment: TRANSAK_ENVIRONMENT,
                message: 'Widget URL created successfully'
            }
        };

    } catch (error) {
        context.log.error('Error creating Transak widget URL:', error);

        // Enhanced error handling
        let errorMessage = 'Failed to create Transak widget URL';
        let statusCode = 500;
        let errorDetails = null;

        if (error.response) {
            statusCode = error.response.status;
            errorDetails = error.response.data;
            
            // Specific error messages based on status codes
            if (error.response.status === 401) {
                errorMessage = 'Invalid API credentials or unauthorized domain';
            } else if (error.response.status === 400) {
                errorMessage = 'Invalid widget configuration or referrer domain not whitelisted';
            } else if (error.response.status === 403) {
                errorMessage = 'Access forbidden - check referrer domain whitelist with Transak';
            } else if (error.response.status === 429) {
                errorMessage = 'Rate limit exceeded - please try again later';
            }
            
            context.log.error('API Error Details:', errorDetails);
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timeout - please try again';
            statusCode = 408;
        }

        context.res = {
            status: statusCode,
            headers: { 'Content-Type': 'application/json' },
            body: { 
                success: false,
                error: errorMessage,
                details: errorDetails,
                referrerDomain: REFERRER_DOMAIN,
                timestamp: new Date().toISOString()
            }
        };
    }
};