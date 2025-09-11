import React, { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { parseEther } from 'viem';

function PaymentDetails({ selectedAsset, selectedChain, setStatus, isEvm }) {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');

  // EVM Hooks
  const { isConnected: isEvmConnected } = useAccount();
  const { data: hash, sendTransaction } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Solana Hooks
  const { connection } = useConnection();
  const { publicKey: solanaPublicKey, sendTransaction: sendSolanaTransaction } = useWallet();

  const handleSend = async () => {
    if (!amount || !toAddress) {
      setStatus('Please enter an address and amount.');
      return;
    }

    setStatus('Preparing transaction...');

    if (isEvm) {
      if (!isEvmConnected) {
        setStatus('Please connect your EVM wallet.');
        return;
      }
      sendTransaction({
        to: toAddress,
        value: parseEther(amount),
      });
      setStatus('Please confirm transaction in your wallet...');
    } else { // Solana
      if (!solanaPublicKey) {
        setStatus('Please connect your Solana wallet.');
        return;
      }
      try {
        const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: solanaPublicKey,
            toPubkey: new PublicKey(toAddress),
            lamports,
          })
        );

        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
        } = await connection.getLatestBlockhashAndContext();
        
        setStatus('Sending Solana transaction...');
        const signature = await sendSolanaTransaction(transaction, connection, { minContextSlot });
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
        
        setStatus(`Success! Signature: ${signature.slice(0, 10)}...`);
      } catch (error) {
        console.error("Solana transaction failed:", error);
        setStatus(`Error: ${error.message}`);
      }
    }
  };
  
  React.useEffect(() => {
    if (isConfirming) setStatus("Confirming EVM transaction...");
    if (isConfirmed) setStatus(`Success! Hash: ${hash.slice(0, 10)}...`);
  }, [isConfirming, isConfirmed, hash, setStatus]);


  return (
    <div className="payment-details">
      <h3>Create Payment</h3>
      <div className="input-group">
        <label>Recipient Address</label>
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder={`Enter ${selectedChain?.name || ''} address`}
        />
      </div>
      <div className="input-group">
        <label>Amount in {selectedAsset}</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
        />
      </div>
      <button className="send-button" onClick={handleSend} disabled={isConfirming}>
        {isConfirming ? 'Sending...' : `Send ${selectedAsset}`}
      </button>
    </div>
  );
}

export default PaymentDetails;
