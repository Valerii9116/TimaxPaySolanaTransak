import React, { useState } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, isAddress } from 'viem';
import { QrReader } from 'react-qr-reader';
import { STABLECOIN_ADDRESSES } from '../config';

function SellStablecoin({ selectedChain, selectedStablecoin, merchantAddress, setStatus, isInteractionDisabled }) {
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    const { data: hash, sendTransaction, isPending } = useSendTransaction();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });

    const handleSend = async () => {
        if (!isAddress(toAddress)) {
            setStatus('Error: Invalid destination address.');
            return;
        }

        const tokenInfo = STABLECOIN_ADDRESSES[selectedChain.id];
        if (!tokenInfo || !tokenInfo[selectedStablecoin]) {
            setStatus('Error: Selected stablecoin not supported on this network.');
            return;
        }
        const tokenAddress = tokenInfo[selectedStablecoin];
        const isNative = selectedStablecoin === 'ETH';

        const decimals = isNative ? 18 : (selectedStablecoin === 'USDC' ? 6 : 18);
        const value = parseUnits(amount, decimals);

        if (isNative) {
            sendTransaction({
                to: toAddress,
                value: value,
            });
        } else {
            // For ERC20 tokens
            const data = `0xa9059cbb${toAddress.substring(2).padStart(64, '0')}${value.toString(16).padStart(64, '0')}`;
            sendTransaction({
                to: tokenAddress,
                data: data,
            });
        }
    };

    const handleScanResult = (result, error) => {
        if (!!result) {
            let scannedAddress = result?.text;
            // Handle ethereum: URI scheme
            if (scannedAddress.startsWith('ethereum:')) {
                scannedAddress = scannedAddress.split(':')[1].split('@')[0];
            }
             if (isAddress(scannedAddress)) {
                setToAddress(scannedAddress);
                setShowScanner(false);
                setStatus('Address scanned successfully.');
            } else {
                setStatus('Error: Scanned QR is not a valid address.');
            }
        }

        if (!!error) {
            // console.info(error);
        }
    };


    return (
        <div className="terminal-body">
            <h3>Send {selectedStablecoin}</h3>
            <div className="selector-group">
                <label htmlFor="to-address">Recipient Address</label>
                <div className="address-input-container">
                    <input
                        id="to-address"
                        type="text"
                        className="address-input"
                        placeholder="0x..."
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                    />
                    <button className="qr-scan-button" onClick={() => setShowScanner(!showScanner)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" x2="17" y1="12" y2="12"/></svg>
                    </button>
                </div>
            </div>

            {showScanner && (
                <QrReader
                    onResult={handleScanResult}
                    style={{ width: '100%' }}
                    constraints={{ facingMode: 'environment' }}
                />
            )}

            <div className="selector-group">
                <label htmlFor="send-amount">Amount</label>
                <input
                    id="send-amount"
                    type="number"
                    className="amount-input"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>

            <button onClick={handleSend} className="launch-button" disabled={isInteractionDisabled || isPending || !toAddress || !amount}>
                {isPending ? 'Sending...' : (isConfirming ? 'Confirming...' : (isConfirmed ? 'Sent!' : `Send ${amount} ${selectedStablecoin}`))}
            </button>
            {hash && <p>Transaction Hash: {hash.substring(0,10)}...</p>}
            {isConfirmed && <p>Transaction Confirmed!</p>}
        </div>
    );
}

export default SellStablecoin;
