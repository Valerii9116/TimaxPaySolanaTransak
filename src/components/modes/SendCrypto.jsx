import React, { useState, useEffect } from 'react';
import { useTerminal } from '../../providers/TerminalProvider';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { QrCode, Send } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const SendCrypto = () => {
  const { selectedAsset, selectedChain, amount, setAmount, setAppStatus } = useTerminal();
  const [toAddress, setToAddress] = useState('');
  const [isScanning, setScanning] = useState(false);

  // EVM Hooks
  const { data: hash, sendTransaction, isPending: isEvmSending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Solana Hooks
  const { connection } = useConnection();
  const { publicKey, sendTransaction: sendSolanaTransaction } = useWallet();
  const [isSolanaSending, setSolanaSending] = useState(false);

  useEffect(() => {
    let scanner;
    if (isScanning) {
      scanner = new Html5QrcodeScanner('qr-scanner-container', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      
      const onScanSuccess = (decodedText) => {
        setToAddress(decodedText);
        setScanning(false);
        setAppStatus('Address scanned successfully!', 'success');
      };

      const onScanFailure = (error) => { /* console.warn(`QR scan failed: ${error}`); */ };
      
      scanner.render(onScanSuccess, onScanFailure);
    }
  
    return () => {
      if (scanner && scanner.getState() === 2) { // 2 is SCANNING state
        scanner.clear().catch(err => console.error("Failed to clear scanner on unmount", err));
      }
    };
  }, [isScanning, setAppStatus]);
  
  useEffect(() => {
    if(isEvmSending) setAppStatus('Check your wallet to confirm...', 'info');
    if (isConfirming) setAppStatus('EVM transaction is confirming...', 'info');
    if (isConfirmed) setAppStatus(`Success! TxHash: ${hash.slice(0, 10)}...`, 'success');
  }, [isEvmSending, isConfirming, isConfirmed, hash, setAppStatus]);

  const handleEVMSend = () => {
    sendTransaction({ to: toAddress, value: parseEther(amount) });
  };

  const handleSolanaSend = async () => {
    if (!publicKey) return;
    setSolanaSending(true);
    setAppStatus('Preparing Solana transaction...', 'info');
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(toAddress),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );
      const signature = await sendSolanaTransaction(transaction, connection);
      setAppStatus(`Transaction sent! Confirming...`, 'info');
      await connection.confirmTransaction(signature, 'processed');
      setAppStatus(`Success! Signature: ${signature.slice(0, 10)}...`, 'success');
    } catch (e) {
      setAppStatus(e.message, 'error');
    } finally {
      setSolanaSending(false);
    }
  };

  const handleSend = () => {
    if (!toAddress || !amount) {
      setAppStatus('Please enter a recipient address and amount.', 'error');
      return;
    }
    if (selectedChain.chainType === 'SOLANA') {
      handleSolanaSend();
    } else {
      handleEVMSend();
    }
  };

  const isLoading = isEvmSending || isConfirming || isSolanaSending;

  return (
    <div className="terminal-content">
      <div className="selector-group">
        <label>Recipient Address</label>
        <div className="address-input-container">
          <input type="text" value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="Enter or scan address" />
          <button className="icon-button" onClick={() => setScanning(prev => !prev)} title="Scan QR Code">
            <QrCode size={20} />
          </button>
        </div>
      </div>
      
      {isScanning && <div id="qr-scanner-container" className="qr-scanner-box"></div>}

      <div className="selector-group">
        <label htmlFor="amount-send">Amount in {selectedAsset}</label>
        <input id="amount-send" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
      </div>
      
      <button onClick={handleSend} disabled={isLoading} className="cta-button">
        <Send size={18} />
        {isLoading ? 'Processing...' : `Send ${selectedAsset}`}
      </button>
    </div>
  );
};

export default SendCrypto;

