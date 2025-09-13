import React from 'react';
import PropTypes from 'prop-types';
import { QRCodeSVG } from 'qrcode.react';
import { useTerminal } from '../../providers/TerminalProvider';
import { Copy } from 'lucide-react';

const AcceptCrypto = ({ merchantAddress }) => {
  const { setAppStatus, amount, setAmount, selectedAsset } = useTerminal();

  const copyToClipboard = () => {
    if (merchantAddress) {
      navigator.clipboard.writeText(merchantAddress);
      setAppStatus('Address copied to clipboard!', 'success');
    }
  };

  return (
    <div className="terminal-content">
      <div className="selector-group">
        <label htmlFor="amount-accept">Amount in {selectedAsset} to Request (Optional)</label>
        <input
          id="amount-accept"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>
      {merchantAddress ? (
        <>
          <div className="qr-code-container">
            <QRCodeSVG value={merchantAddress} size={200} bgColor={"#1a1a1a"} fgColor={"#f0f0f0"} />
          </div>
          <div className="address-display">
            <span>{merchantAddress}</span>
            <button onClick={copyToClipboard} className="icon-button" title="Copy Address">
              <Copy size={16} />
            </button>
          </div>
        </>
      ) : (
        <div className="status-message">Connect wallet to display QR code.</div>
      )}
    </div>
  );
};

AcceptCrypto.propTypes = {
  merchantAddress: PropTypes.string,
};

export default AcceptCrypto;

