import React, { useState } from 'react';
import { Transak } from '@transak/transak-sdk';

function PaymentTerminal({ apiKey, merchantAddress, setStatus }) {
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
      environment: 'PRODUCTION', // Change to PRODUCTION for live
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

    transak.init();

    Transak.on(Transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
      setStatus('Widget closed.');
      transak.close();
    });
    Transak.on(Transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
      setStatus(`Success! ${isBuyFlow ? 'Payment received.' : 'Withdrawal complete.'}`);
      setTimeout(() => transak.close(), 5000);
    });
    Transak.on(Transak.EVENTS.TRANSAK_ORDER_FAILED, () => {
      setStatus('Transaction failed.');
    });
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
          {terminalMode === 'PAYMENT' ? `Charge ${amount} ${fiatCurrency}` : `Withdraw ${amount} USDC`}
        </button>
      </div>
    </div>
  );
}
export default PaymentTerminal;
