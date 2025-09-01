import React, { useState } from 'react';
import Transak from '@transak/transak-sdk';

function PaymentTerminal({ apiKey, environment, merchantAddress, setStatus, onNewTransaction }) {
  const [fiatCurrency, setFiatCurrency] = useState('GBP');
  const [amount, setAmount] = useState('20.00');
  const [terminalMode, setTerminalMode] = useState('PAYMENT');

  const launchTransak = () => {
    if (parseFloat(amount) < 20) {
      setStatus('Error: Minimum amount is 20.');
      return;
    }

    const isBuyFlow = terminalMode === 'PAYMENT';
    setStatus(`Initializing ${isBuyFlow ? 'Payment' : 'Withdrawal'}...`);
    
    const transak = new Transak({
      apiKey: apiKey,
      environment: environment,
      productsAvailed: isBuyFlow ? 'BUY' : 'SELL',
      fiatCurrency: fiatCurrency,
      cryptoCurrencyCode: 'USDC',
      network: 'polygon',
      walletAddress: merchantAddress,
      fiatAmount: isBuyFlow ? parseFloat(amount) : undefined,
      cryptoAmount: isBuyFlow ? undefined : parseFloat(amount),
      partnerCustomerId: merchantAddress, 
      disableWalletAddressForm: true,
      hideMenu: true,
      widgetHeight: '650px',
      widgetWidth: '100%',
    });

    const handleOrderSuccessful = (orderData) => {
      // Log the full data object to the console for easier debugging in the future
      console.log("Transak Success Data:", JSON.stringify(orderData, null, 2));
      setStatus('Success! The transaction was completed.');
      
      const transactionDetails = orderData.status || orderData;

      // Use the transaction ID if available, otherwise fall back to the transaction hash as a unique identifier
      const transactionId = transactionDetails.id || transactionDetails.transactionHash;

      if (onNewTransaction && transactionId) {
        const transactionType = isBuyFlow ? 'Payment' : 'Withdrawal';
        
        // Create a new transaction object with fallbacks to prevent errors
        const newTransaction = {
            id: transactionId,
            type: transactionType,
            status: transactionDetails.status || 'COMPLETED',
            createdAt: transactionDetails.createdAt || new Date().toISOString(),
            transactionHash: transactionDetails.transactionHash,
            cryptoAmount: transactionDetails.cryptoAmount || 0,
            cryptoCurrency: transactionDetails.cryptoCurrency || 'USDC',
            fiatAmount: transactionDetails.fiatAmount || 0,
            fiatCurrency: transactionDetails.fiatCurrency || fiatCurrency,
        };
        
        onNewTransaction(newTransaction);
      } else {
        console.error("Could not process transaction success data: A unique ID or hash is missing.", transactionDetails);
        setStatus("Error: Could not record the transaction in the history.");
      }
      
      setTimeout(() => transak.close(), 3000);
    };

    const handleOrderFailed = (orderData) => {
      setStatus('Transaction failed.');
      setTimeout(() => transak.close(), 3000);
    };

    const handleWidgetClose = () => {
      setStatus('Widget closed by user.');
    };

    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, handleOrderSuccessful);
    transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, handleOrderFailed);
    transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, handleWidgetClose);

    transak.init();
  };

  return (
    <div className="step-card actions-container">
      <div className="terminal-tabs">
        <button onClick={() => setTerminalMode('PAYMENT')} className={terminalMode === 'PAYMENT' ? 'active' : ''}>Accept Payment</button>
        <button onClick={() => setTerminalMode('WITHDRAW')} className={terminalMode === 'WITHDRAW' ? 'active' : ''}>Withdraw Funds</button>
      </div>
      <div className="terminal-body">
        <h3>{terminalMode === 'PAYMENT' ? 'Enter Amount to Charge' : 'Enter Amount to Withdraw'}</h3>
        <div className="amount-input-container">
          <input 
            type="number" 
            className="amount-input" 
            value={amount}
            min="20"
            onChange={(e) => setAmount(e.target.value)}
          />
          <select className="currency-select" value={fiatCurrency} onChange={(e) => setFiatCurrency(e.target.value)}>
            <option value="GBP">GBP</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <button onClick={launchTransak} className="launch-button">
          {terminalMode === 'PAYMENT' ? `Charge ${amount} ${fiatCurrency}` : `Withdraw ${amount} USDC to ${fiatCurrency}`}
        </button>
      </div>
    </div>
  );
}
export default PaymentTerminal;

