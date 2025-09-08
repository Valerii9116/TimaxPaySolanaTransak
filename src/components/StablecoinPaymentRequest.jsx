import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { parseUnits } from 'viem';
import { STABLECOIN_ADDRESSES } from '../config';

// Helper to map stablecoin symbols to CoinGecko API IDs
const getCoinGeckoId = (symbol) => {
    const map = {
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'PYUSD': 'paypal-usd',
        'EURC': 'euro-coin',
        'ETH': 'ethereum'
    };
    return map[symbol.toUpperCase()];
}

function StablecoinPaymentRequest({
    selectedChain,
    selectedStablecoin,
    merchantAddress,
    setStatus
}) {
    const [fiatCurrency, setFiatCurrency] = useState('GBP');
    const [fiatAmount, setFiatAmount] = useState('20.00');
    const [cryptoAmount, setCryptoAmount] = useState(0);
    const [isLoadingPrice, setIsLoadingPrice] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Fetch the stablecoin price whenever the fiat amount or currencies change
    useEffect(() => {
        const fetchPrice = async () => {
            if (parseFloat(fiatAmount) <= 0 || !selectedStablecoin) return;

            setIsLoadingPrice(true);
            setStatus('Fetching latest exchange rate...');

            const coinId = getCoinGeckoId(selectedStablecoin);
            if (!coinId) {
                setStatus(`Error: Unsupported asset for price feed.`);
                setIsLoadingPrice(false);
                return;
            }

            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${fiatCurrency.toLowerCase()}`);
                if (!response.ok) throw new Error('Failed to fetch price data.');

                const data = await response.json();
                const rate = data[coinId][fiatCurrency.toLowerCase()];

                if (rate) {
                    setCryptoAmount(parseFloat(fiatAmount) / rate);
                    setStatus(''); // Clear status on success
                } else {
                    throw new Error('Exchange rate not found.');
                }

            } catch (error) {
                console.error("Price fetch error:", error);
                setStatus(`Error: ${error.message}`);
                setCryptoAmount(0);
            } finally {
                setIsLoadingPrice(false);
            }
        };

        const debounceTimer = setTimeout(fetchPrice, 500); // Debounce to avoid too many API calls
        return () => clearTimeout(debounceTimer);

    }, [fiatAmount, fiatCurrency, selectedStablecoin, setStatus]);


    // Generate the EIP-681 payment URI for the QR Code
    const generatePaymentURI = () => {
        if (!merchantAddress || !selectedChain || !selectedStablecoin || cryptoAmount <= 0) {
            return 'invalid';
        }

        const isNative = selectedStablecoin === 'ETH';
        const tokenInfo = STABLECOIN_ADDRESSES[selectedChain.id];

        if (!isNative && (!tokenInfo || !tokenInfo[selectedStablecoin])) return 'invalid';

        const tokenAddress = isNative ? '' : tokenInfo[selectedStablecoin];
        const tokenDecimals = isNative ? 18 : (selectedStablecoin === 'USDC' ? 6 : 18); // Common decimals
        const amountInSmallestUnit = parseUnits(cryptoAmount.toFixed(tokenDecimals), tokenDecimals);

        if(isNative) {
            return `ethereum:${merchantAddress}@${selectedChain.id}?value=${amountInSmallestUnit.toString()}`;
        }

        return `ethereum:${tokenAddress}@${selectedChain.id}/transfer?address=${merchantAddress}&uint256=${amountInSmallestUnit.toString()}`;
    };

    const paymentURI = generatePaymentURI();

    const handleCopy = () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }

    return (
        <div className="stablecoin-payment-view">
            <h3>Accept {selectedStablecoin} Payment</h3>

            <div className="amount-input-container">
              <input
                type="number"
                className="amount-input"
                value={fiatAmount}
                min="1"
                onChange={(e) => setFiatAmount(e.target.value)}
              />
              <select className="currency-select" value={fiatCurrency} onChange={(e) => setFiatCurrency(e.target.value)}>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div className="payment-summary">
                <span>Client Pays:</span>
                <span className="crypto-amount-display">
                    {isLoadingPrice ? 'Calculating...' : `${cryptoAmount.toFixed(4)} ${selectedStablecoin}`}
                </span>
            </div>

            <div className="qr-code-container">
                {paymentURI !== 'invalid' ? (
                     <QRCode value={paymentURI} size={200} bgColor="#ffffff" fgColor="#1e1e1e" level="H" />
                ) : (
                    <div className="qr-placeholder">Enter a valid amount to generate QR Code</div>
                )}
            </div>

            <div className="payment-address-details">
                <p>Send to this address on the {selectedChain.name} network:</p>
                <div className="address-bar">
                    <span className="address-text">{merchantAddress}</span>
                    <CopyToClipboard text={merchantAddress} onCopy={handleCopy}>
                        <button className="copy-button">{isCopied ? 'Copied!' : 'Copy'}</button>
                    </CopyToClipboard>
                </div>
            </div>
        </div>
    );
}

export default StablecoinPaymentRequest;
