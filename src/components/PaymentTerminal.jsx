import React, { useState } from 'react';
import Transak from '@transak/transak-sdk';

import { SUPPORTED_CHAINS, ASSET_ADDRESSES, TRANSAK_NETWORK_MAP } from '../config.js';
import AcceptCrypto from './AcceptCrypto.jsx';
import SendCrypto from './SendCrypto.jsx';

function PaymentTerminal(props) {
  const [mode, setMode] = useState('ACCEPT_CRYPTO');
  const { selectedChain, setSelectedChain, selectedAsset, setSelectedAsset, apiKey, environment, merchantAddress, setStatus } = props;
  const availableAssets = Object.keys(ASSET_ADDRESSES[selectedChain.id] || {});
  const [fiatAmount, setFiatAmount] = useState('20.00');
  const [cryptoAmount, setCryptoAmount] = useState('100.00');
  const [fiatCurrency, setFiatCurrency] = useState('GBP');

  const handleNetworkChange = (e) => {
    const newChain = SUPPORTED_CHAINS.find(c => String(c.id) === e.target.value);
    if (newChain) { 
        setSelectedChain(newChain); 
        const newAssets = Object.keys(ASSET_ADDRESSES[newChain.id] || {});
        setSelectedAsset(newAssets[0] || null);
    }
  };

  const launchTransak = () => {
    const isSellFlow = mode === 'WITHDRAW';
    const transakConfig = { apiKey, environment, productsAvailed: isSellFlow ? 'SELL' : 'BUY', fiatCurrency, cryptoCurrencyCode: selectedAsset, network: TRANSAK_NETWORK_MAP[selectedChain.id], walletAddress: isSellFlow ? undefined : merchantAddress, walletAddressToSell: isSellFlow ? merchantAddress : undefined, fiatAmount: isSellFlow ? undefined : parseFloat(fiatAmount), cryptoAmount: isSellFlow ? parseFloat(cryptoAmount) : undefined, disableWalletAddressForm: !isSellFlow, hideMenu: true };
    setStatus(`Initializing ${isSellFlow ? 'Withdrawal' : 'Payment'}...`);
    const transak = new Transak(transakConfig);
    transak.init();
    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, () => { setStatus(`Success! The ${isSellFlow ? 'withdrawal' : 'payment'} was completed.`); transak.close(); });
    transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, () => { setStatus(`The ${isSellFlow ? 'withdrawal' : 'payment'} failed.`); transak.close(); });
  };

  const renderContent = () => {
    switch(mode) {
      case 'ACCEPT_CRYPTO': return <AcceptCrypto {...props} />;
      case 'SEND_CRYPTO': return <SendCrypto {...props} />;
      case 'FIAT_PAYMENT': return (
        <div className="terminal-body"><h3>Accept Fiat Payment</h3><div className="amount-input-container"><input type="number" className="amount-input" value={fiatAmount} min="20" onChange={e => setFiatAmount(e.target.value)} /><select className="currency-select" value={fiatCurrency} onChange={e => setFiatCurrency(e.target.value)}><option value="GBP">GBP</option><option value="EUR">EUR</option><option value="USD">USD</option></select></div><button onClick={launchTransak} className="launch-button">Charge {fiatAmount} {fiatCurrency}</button></div>
      );
      case 'WITHDRAW': return (
        <div className="terminal-body"><h3>Withdraw {selectedAsset} to Fiat</h3><div className="amount-input-container"><input type="number" className="amount-input" value={cryptoAmount} onChange={e => setCryptoAmount(e.target.value)} placeholder="0.00" /><select className="currency-select" value={fiatCurrency} onChange={e => setFiatCurrency(e.target.value)}><option value="GBP">GBP</option><option value="EUR">EUR</option><option value="USD">USD</option></select></div><button onClick={launchTransak} className="launch-button">Withdraw {cryptoAmount} {selectedAsset}</button></div>
      );
      default: return null;
    }
  }

  return (
    <div className="step-card">
      <div className="terminal-tabs"><button onClick={() => setMode('FIAT_PAYMENT')} className={mode === 'FIAT_PAYMENT' ? 'active' : ''}>Accept Fiat</button><button onClick={() => setMode('ACCEPT_CRYPTO')} className={mode === 'ACCEPT_CRYPTO' ? 'active' : ''}>Accept Crypto</button><button onClick={() => setMode('SEND_CRYPTO')} className={mode === 'SEND_CRYPTO' ? 'active' : ''}>Send Crypto</button><button onClick={() => setMode('WITHDRAW')} className={mode === 'WITHDRAW' ? 'active' : ''}>Withdraw</button></div>
      <div className="network-selectors"><div className="selector-group"><label>Network</label><select value={selectedChain.id} onChange={handleNetworkChange}>{SUPPORTED_CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div className="selector-group"><label>Asset</label><select value={selectedAsset || ''} onChange={e => setSelectedAsset(e.target.value)} disabled={availableAssets.length === 0}>{availableAssets.length > 0 ? availableAssets.map(a => <option key={a} value={a}>{a}</option>) : <option>Unavailable</option>}</select></div></div>
      {renderContent()}
    </div>
  );
};

export default PaymentTerminal;

