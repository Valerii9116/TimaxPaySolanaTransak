const webpack = require('webpack');

module.exports = function override(config, env) {
    // Add fallbacks for Node.js core modules
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "process": require.resolve("process/browser"),
        "buffer": require.resolve("buffer"),
        "util": require.resolve("util"),
        "url": require.resolve("url"),
        "assert": require.resolve("assert"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "http": require.resolve("stream-http")
    };

    // Add the ProvidePlugin to make modules globally available
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);
    
    // This rule is to handle a specific issue with @web3modal/wagmi
    config.module.rules.push({
        test: /\.m?js$/,
        resolve: {
            fullySpecified: false,
        },
    });


    return config;
}

