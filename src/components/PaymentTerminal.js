import React, { useState } from 'react';
import Transak from '@transak/transak-sdk';
import { SUPPORTED_CHAINS, SUPPORTED_STABLECOINS, TRANSAK_NETWORK_MAP, STABLECOIN_ADDRESSES } from '../config';
import StablecoinPaymentRequest from './StablecoinPaymentRequest';
import SellStablecoin from './SellStablecoin';

function PaymentTerminal({
    apiKey,
    environment,
    merchantAddress,
    setStatus,
    selectedChain,
    setSelectedChain,
    selectedStablecoin,
    setSelectedStablecoin,
    isInteractionDisabled
}) {
  const [fiatCurrency, setFiatCurrency] = useState('GBP');
  const [amount, setAmount] = useState('20.00');
  const [terminalMode, setTerminalMode] = useState('FIAT_PAYMENT'); // FIAT_PAYMENT, WITHDRAW, STABLECOIN_PAYMENT, SELL_STABLECOIN

  const launchTransak = () => {
    if (parseFloat(amount) < 20 && terminalMode !== 'SELL_STABLECOIN') {
      setStatus('Error: Minimum amount is 20.');
      return;
    }

    const isBuyFlow = terminalMode === 'FIAT_PAYMENT';
    const transakNetwork = TRANSAK_NETWORK_MAP[selectedChain.id];
    if (!transakNetwork) {
        setStatus(`Error: The selected network "${selectedChain.name}" is not supported by the payment provider.`);
        return;
    }

    setStatus(`Initializing ${isBuyFlow ? 'Payment' : 'Withdrawal'}...`);

    const transak = new Transak({
      apiKey: apiKey,
      environment: environment,
      productsAvailed: isBuyFlow ? 'BUY' : 'SELL',
      fiatCurrency: fiatCurrency,
      cryptoCurrencyCode: selectedStablecoin,
      network: transakNetwork,
      walletAddress: merchantAddress,
      fiatAmount: isBuyFlow ? parseFloat(amount) : undefined,
      cryptoAmount: isBuyFlow ? undefined : parseFloat(amount),
      partnerCustomerId: merchantAddress,
      disableWalletAddressForm: true,
      hideMenu: true,
      widgetHeight: '650px',
      widgetWidth: '100%',
    });

    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
        setStatus('Success! The transaction was completed.');
        setTimeout(() => transak.close(), 3000);
    });
    transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, () => {
      setStatus('Transaction failed.');
      setTimeout(() => transak.close(), 3000);
    });
    transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
      setStatus('Widget closed by user.');
    });

    transak.init();
  };

  const handleNetworkChange = (e) => {
    const chainId = parseInt(e.target.value, 10);
    const newChain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    if (newChain) {
        setSelectedChain(newChain);
        const availableCoins = SUPPORTED_STABLECOINS.filter(c => !!STABLECOIN_ADDRESSES[newChain.id]?.[c.symbol]);
        if (!availableCoins.some(c => c.symbol === selectedStablecoin)) {
            setSelectedStablecoin(availableCoins[0]?.symbol || '');
        }
    }
  };

  const availableStablecoins = SUPPORTED_STABLECOINS.filter(
    coin => !!STABLECOIN_ADDRESSES[selectedChain.id]?.[coin.symbol]
  );

  const renderTerminalContent = () => {
    if (terminalMode === 'STABLECOIN_PAYMENT') {
        return (
            <StablecoinPaymentRequest
                selectedChain={selectedChain}
                selectedStablecoin={selectedStablecoin}
                merchantAddress={merchantAddress}
                setStatus={setStatus}
            />
        );
    }

    if (terminalMode === 'SELL_STABLECOIN') {
        return (
            <SellStablecoin
                selectedChain={selectedChain}
                selectedStablecoin={selectedStablecoin}
                merchantAddress={merchantAddress}
                setStatus={setStatus}
                isInteractionDisabled={isInteractionDisabled}
            />
        );
    }

    // Default to the Transak-based payment/withdrawal view
    return (
        <div className="terminal-body">
            <h3>{terminalMode === 'FIAT_PAYMENT' ? 'Enter Amount to Charge' : 'Enter Amount to Withdraw'}</h3>
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
            <button
            onClick={launchTransak}
            className="launch-button"
            disabled={availableStablecoins.length === 0 || isInteractionDisabled}
            >
            {isInteractionDisabled
                ? 'Switch Network to Continue'
                : terminalMode === 'FIAT_PAYMENT'
                    ? `Charge ${amount} ${fiatCurrency}`
                    : `Withdraw ${amount} ${selectedStablecoin} to ${fiatCurrency}`
            }
            </button>
      </div>
    );
  }

  return (
    <div className="step-card actions-container">
      <div className="terminal-tabs">
        <button onClick={() => setTerminalMode('FIAT_PAYMENT')} className={terminalMode === 'FIAT_PAYMENT' ? 'active' : ''}>Accept Payment</button>
        <button onClick={() => setTerminalMode('STABLECOIN_PAYMENT')} className={terminalMode === 'STABLECOIN_PAYMENT' ? 'active' : ''}>Accept Stablecoin</button>
        <button onClick={() => setTerminalMode('SELL_STABLECOIN')} className={terminalMode === 'SELL_STABLECOIN' ? 'active' : ''}>Send Stablecoin</button>
        <button onClick={() => setTerminalMode('WITHDRAW')} className={terminalMode === 'WITHDRAW' ? 'active' : ''}>Withdraw Funds</button>
      </div>

      <div className="network-selectors">
        <div className="selector-group">
            <label htmlFor="network-select">Network</label>
            <select id="network-select" value={selectedChain.id} onChange={handleNetworkChange}>
                {SUPPORTED_CHAINS.map(chain => (
                    <option key={chain.id} value={chain.id}>{chain.name}</option>
                ))}
            </select>
        </div>
        <div className="selector-group">
             <label htmlFor="stablecoin-select">Asset</label>
            <select id="stablecoin-select" value={selectedStablecoin} onChange={(e) => setSelectedStablecoin(e.target.value)} disabled={availableStablecoins.length === 0}>
                {availableStablecoins.length > 0 ? availableStablecoins.map(coin => (
                    <option key={coin.symbol} value={coin.symbol}>{coin.symbol}</option>
                )) : <option>Not Available</option>}
            </select>
        </div>
      </div>

      {renderTerminalContent()}
    </div>
  );
}
export default PaymentTerminal;