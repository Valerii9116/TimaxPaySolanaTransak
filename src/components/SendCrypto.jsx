import React, { useState, useEffect } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { isAddress, parseUnits } from 'viem';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { Html5Qrcode } from 'html5-qrcode';

import { SUPPORTED_ASSETS, ASSET_ADDRESSES } from '../config.js';

function SendCrypto({ selectedChain, selectedAsset, setStatus, isInteractionDisabled }) {
  const { data: hash, sendTransaction } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const { connection } = useConnection();
  const { publicKey, sendTransaction: sendSolanaTransaction } = useWallet();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isScanning, setScanning] = useState(false);

  useEffect(() => {
    let scanner;
    if (isScanning) {
        scanner = new Html5Qrcode('qr-scanner-container');
        const onScanSuccess = (decodedText) => {
            const address = decodedText.replace("ethereum:", "").split("?")[0];
            setToAddress(address);
            setScanning(false);
        };
        scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, (e) => console.warn(e))
        .catch(err => setStatus(`Scanner Error: ${err}. Ensure camera permissions.`));
    }
    return () => {
        if (scanner && scanner.isScanning) {
            scanner.stop().catch(err => console.error("Failed to stop scanner.", err));
        }
    };
  }, [isScanning, setStatus]);

  const handleSend = async () => {
    setStatus('Preparing transaction...');
    if (selectedChain.chainType === 'EVM') {
      if (!isAddress(toAddress)) return setStatus('Error: Invalid EVM address.');
      const decimals = SUPPORTED_ASSETS[selectedAsset]?.decimals || 18;
      sendTransaction({ to: toAddress, value: parseUnits(amount, decimals) });
    } else if (selectedChain.chainType === 'SOLANA') {
      try {
        if (!publicKey) throw new Error('Solana wallet not connected');
        const transaction = new Transaction();
        const recipient = new PublicKey(toAddress);
        const decimals = SUPPORTED_ASSETS[selectedAsset]?.decimals || 9;
        const lamports = parseFloat(amount) * (10 ** decimals);
        if (SUPPORTED_ASSETS[selectedAsset]?.type === 'NATIVE') {
          transaction.add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: recipient, lamports }));
        } else {
          const mint = new PublicKey(ASSET_ADDRESSES.solana[selectedAsset]);
          const fromATA = await getAssociatedTokenAddress(mint, publicKey);
          const toATA = await getAssociatedTokenAddress(mint, recipient, true);
          transaction.add(createTransferInstruction(fromATA, toATA, publicKey, lamports));
        }
        setStatus('Sending Solana transaction...');
        const signature = await sendSolanaTransaction(transaction, connection);
        await connection.confirmTransaction(signature, 'processed');
        setStatus(`Success! Signature: ${signature.slice(0, 20)}...`);
      } catch (e) { setStatus(`Error: ${e.message}`); console.error(e); }
    }
  };

  useEffect(() => {
    if (isConfirming) setStatus("Confirming EVM transaction...");
    if (isConfirmed) setStatus(`Success! Hash: ${hash.slice(0, 20)}...`);
  }, [isConfirming, isConfirmed, hash, setStatus]);

  return (
    <div className="terminal-body">
      <h3>Send {selectedAsset}</h3>
      <div className="selector-group">
        <label>Recipient Address</label>
        <div className="address-input-container">
          <input type="text" value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder={`Enter ${selectedChain.chainType} address`} />
          <button className="qr-scan-button" onClick={() => setScanning(!isScanning)}>
            <svg viewBox="0 0 24 24"><path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 21h8v-8h-8v8zm2-6h4v4h-4v-4z"/></svg>
          </button>
        </div>
        {isScanning && <div id="qr-scanner-container"></div>}
      </div>
      <div className="selector-group"><label>Amount</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
      <button className="launch-button" onClick={handleSend} disabled={isInteractionDisabled || !toAddress || !amount}>
        Send {amount || '0.00'} {selectedAsset}
      </button>
    </div>
  );
}

export default SendCrypto;

