import React, { useState, useEffect } from 'react';

// --- DEPENDENCIES ---
import QRCode from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { parseUnits } from 'viem';

function AcceptCrypto({ selectedChain, selectedAsset, merchantAddress }) {
  const [fiatAmount, setFiatAmount] = useState('20.00');
  const [cryptoAmount, setCryptoAmount] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Helper to map asset symbols to CoinGecko API IDs
  const getCoinGeckoId = (symbol) => {
    const map = {
      'ETH': 'ethereum',
      'USDC': 'usd-coin',
      'SOL': 'solana',
      // Add other assets here if needed for price quotes
    };
    return map[symbol.toUpperCase()];
  }

  useEffect(() => {
    const fetchPrice = async () => {
      if (parseFloat(fiatAmount) <= 0 || !selectedAsset) return;
      
      const coinId = getCoinGeckoId(selectedAsset);
      if (!coinId) {
        setCryptoAmount(0); // Cannot fetch price for this asset
        return;
      }

      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=gbp`);
        if (!res.ok) throw new Error('Failed to fetch price from CoinGecko');
        const data = await res.json();
        if (data[coinId]?.gbp) {
          setCryptoAmount(parseFloat(fiatAmount) / data[coinId].gbp);
        }
      } catch (e) {
        console.error("Price fetch error:", e);
        setCryptoAmount(0);
      }
    };

    const timer = setTimeout(fetchPrice, 500); // Debounce API calls
    return () => clearTimeout(timer);
  }, [fiatAmount, selectedAsset]);

  // Generate the appropriate payment URI for the QR code
  const paymentURI = selectedChain.chainType === 'EVM' && cryptoAmount > 0
    ? `ethereum:${merchantAddress}?value=${parseUnits(String(cryptoAmount), 18).toString()}`
    : merchantAddress;

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="terminal-body">
      <h3>Accept {selectedAsset}</h3>
      <div className="amount-input-container">
        <input
          type="number"
          className="amount-input"
          value={fiatAmount}
          onChange={(e) => setFiatAmount(e.target.value)}
        />
        <select className="currency-select">
          <option value="GBP">GBP</option>
        </select>
      </div>
      <div className="qr-code-container">
        <QRCode value={paymentURI || 'address-missing'} size={180} level="H" />
      </div>
      <div className="address-bar">
        <span className="address-text">{merchantAddress}</span>
        <CopyToClipboard text={merchantAddress || ''} onCopy={handleCopy}>
          <button className="copy-button">{isCopied ? 'Copied!' : 'Copy'}</button>
        </CopyToClipboard>
      </div>
    </div>
  );
};

export default AcceptCrypto;

