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
      fiatCurrency: fiatCurrency, // Use selected fiat currency for both buy and sell
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

    // Define event handlers
    const handleOrderSuccessful = (orderData) => {
      setStatus('Success! The transaction was completed.');
      if (onNewTransaction && orderData.status) {
        const transactionType = isBuyFlow ? 'Payment' : 'Withdrawal';
        onNewTransaction({ ...orderData.status, type: transactionType });
      }
      setTimeout(() => transak.close(), 3000);
    };

    const handleOrderFailed = () => {
      setStatus('Transaction failed.');
    };
    
    // This handler will be called when the widget is closed
    const handleWidgetClose = () => {
      setStatus('Widget closed.');
      // The transak instance is short-lived, so manual listener removal is not required here.
      // The duplicate transaction issue is handled in App.js.
    };

    // Attach listeners to the instance
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

