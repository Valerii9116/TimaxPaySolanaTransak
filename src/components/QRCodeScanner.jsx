import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRCodeScanner = ({ onScanSuccess, onScanFailure }) => {
  useEffect(() => {
    const qrScanner = new Html5QrcodeScanner(
      "qr-scanner-container", 
      { fps: 10, qrbox: 250 }, 
      false // verbose
    );

    qrScanner.render(onScanSuccess, onScanFailure);

    // Cleanup function to stop the scanner
    return () => {
      qrScanner.clear().catch(error => {
        console.error("Failed to clear html5-qrcode-scanner.", error);
      });
    };
  }, [onScanSuccess, onScanFailure]);

  return <div id="qr-scanner-container" />;
};

QRCodeScanner.propTypes = {
    onScanSuccess: PropTypes.func.isRequired,
    onScanFailure: PropTypes.func.isRequired,
};

export default QRCodeScanner;