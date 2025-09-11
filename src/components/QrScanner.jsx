import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

// This component provides a QR code scanning modal overlay.
function QrScanner({ onSuccess, onCancel }) {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "qr-reader", // ID of the div element to render the scanner
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }, // Defines the viewfinder box
                rememberLastUsedCamera: true,
                supportedScanTypes: [0] // 0 for camera
            },
            false // verbose
        );

        const handleSuccess = (decodedText, decodedResult) => {
            scanner.clear();
            onSuccess(decodedText);
        };

        const handleError = (errorMessage) => {
            // Errors are logged but don't stop the scanner.
            // You can add logic here if needed.
        };

        scanner.render(handleSuccess, handleError);

        // Cleanup function to stop the scanner when the component unmounts
        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear Html5QrcodeScanner.", error);
            });
        };
    }, [onSuccess]);

    return (
        <div className="qr-scanner-modal">
            <div className="qr-scanner-content">
                <h3 className="mb-2">Scan QR Code</h3>
                <div id="qr-reader"></div>
                <button className="action-button mt-2" style={{backgroundColor: 'var(--surface-3)'}} onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default QrScanner;
