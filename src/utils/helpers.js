/**
 * Shortens a wallet address for display.
 * @param {string} address The full wallet address.
 * @returns {string} The shortened address (e.g., "0x123...4567").
 */
export const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Formats a balance string for display, trimming unnecessary decimals.
 * @param {string | undefined} balance The raw balance string.
 * @param {number} decimals The number of decimals for the token.
 * @returns {string} A formatted, readable balance string.
 */
export const formatBalance = (balance, decimals = 18) => {
    if (!balance) return '0.00';
    // Use Number formatting to handle large and small numbers gracefully
    const num = parseFloat(balance);
    if (isNaN(num)) return '0.00';

    if (num > 1000) {
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (num > 0.01) {
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    } else {
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
    }
};
