import React, { useState } from 'react';
import Transak from '@transak/transak-sdk';

function PaymentTerminal({ apiKey, merchantAddress, setStatus }) {
  const [fiatCurrency, setFiatCurrency] = useState('GBP');
  const [amount, setAmount] = useState('10.00');
  const [terminalMode, setTerminalMode] = useState('PAYMENT'); // PAYMENT or WITHDRAW

  const launchTransak = () => {
    const isBuyFlow = terminalMode === 'PAYMENT';
    setStatus(`Initializing ${isBuyFlow ? 'Payment' : 'Withdrawal'}...`);
    
    const transak = new Transak({
      apiKey: apiKey,
      environment: 'STAGING', // Change to PRODUCTION for live
      productsAvailed: isBuyFlow ? 'BUY' : 'SELL',
      fiatCurrency: fiatCurrency,
      cryptoCurrencyCode: 'USDC',
      network: 'polygon',
      // For a BUY, the merchant's wallet is the destination.
      // For a SELL, the merchant's wallet is the source.
      walletAddress: merchantAddress,
      // For a BUY, the amount is what the customer pays.
      // For a SELL, this is the amount of USDC the merchant sells.
      fiatAmount: isBuyFlow ? parseFloat(amount) : undefined,
      cryptoAmount: isBuyFlow ? undefined : parseFloat(amount),
      partnerCustomerId: merchantAddress, 
      disableWalletAddressForm: true,
      hideMenu: true,
      widgetHeight: '650px',
      widgetWidth: '100%',
    });

    transak.init();

    transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => setStatus('Widget closed.'));
    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
      setStatus(`Success! ${isBuyFlow ? 'Payment received.' : 'Withdrawal complete.'}`);
      setTimeout(() => transak.close(), 5000);
    });
    transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, () => setStatus('Transaction failed.'));
  };

  return (
    <div className="step-card actions-container">
      <div className="terminal-tabs">
        <button onClick={() => setTerminalMode('PAYMENT')} className={terminalMode === 'PAYMENT' ? 'active' : ''}>Accept Payment</button>
        <button onClick={() => setTerminalMode('WITHDRAW')} className={terminalMode === 'WITHDRAW' ? 'active' : ''}>Withdraw Funds</button>
      </div>

      <div className="terminal-body">
        {terminalMode === 'PAYMENT' ? (
          <h3>Enter Amount to Charge Customer</h3>
        ) : (
          <h3>Enter Amount to Withdraw</h3>
        )}

        <div className="amount-input-container">
          <input 
            type="number" 
            className="amount-input" 
            value={amount}
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