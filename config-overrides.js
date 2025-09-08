const webpack = require('webpack');

module.exports = function override(config, env) {
    // Add fallbacks for Node.js core modules
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "vm": require.resolve("vm-browserify"),
        "process/browser": require.resolve("process/browser")
    };

    // Add the ProvidePlugin to make modules globally available
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);

    // This is to address a specific issue with some dependencies
    config.ignoreWarnings = [/Failed to parse source map/];

    return config;
};

