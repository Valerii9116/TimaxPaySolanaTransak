import React, { useState } from 'react';
import { Transak } from '@transak/transak-sdk';
import { useSwitchChain } from 'wagmi';

const supportedChains = [
    { id: 137, name: 'Polygon', transakName: 'polygon' },
    { id: 1, name: 'Ethereum', transakName: 'ethereum' },
    { id: 42161, name: 'Arbitrum', transakName: 'arbitrum' },
    { id: 59144, name: 'Linea', transakName: 'linea' },
    { id: 43114, name: 'Avalanche', transakName: 'avalanche' },
];

const supportedAssets = ['USDC', 'USDT'];

function PaymentTerminal({ apiKey, environment, merchantAddress, setStatus, activeChainId }) {
  const [fiatCurrency, setFiatCurrency] = useState('GBP');
  const [amount, setAmount] = useState('20.00');
  const [terminalMode, setTerminalMode] = useState('PAYMENT');
  const [selectedChainId, setSelectedChainId] = useState(137);
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  
  const { switchChain } = useSwitchChain();

  const handleNetworkChange = (chainId) => {
    setSelectedChainId(Number(chainId));
    if (activeChainId !== Number(chainId)) {
        switchChain({ chainId: Number(chainId) });
    }
  }

  const launchTransak = () => {
    if (parseFloat(amount) < 20) {
      setStatus('Error: Minimum amount is 20.');
      return;
    }

    if (activeChainId !== selectedChainId) {
        setStatus('Error: Please switch your wallet to the selected network before proceeding.');
        return;
    }

    const selectedNetwork = supportedChains.find(c => c.id === selectedChainId);
    if (!selectedNetwork) {
        setStatus('Error: Selected network is not supported.');
        return;
    }

    const isBuyFlow = terminalMode === 'PAYMENT';
    setStatus(`Initializing ${isBuyFlow ? 'Payment' : 'Withdrawal'}...`);
    
    const transak = new Transak({
      apiKey: apiKey,
      environment: environment,
      productsAvailed: isBuyFlow ? 'BUY' : 'SELL',
      fiatCurrency: fiatCurrency,
      cryptoCurrencyCode: selectedAsset,
      network: selectedNetwork.transakName,
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
    Transak.on(Transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, () => {
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
        <div className="selectors-grid">
            <div>
                <label>Network</label>
                <select value={selectedChainId} onChange={(e) => handleNetworkChange(e.target.value)}>
                    {supportedChains.map(chain => <option key={chain.id} value={chain.id}>{chain.name}</option>)}
                </select>
            </div>
            <div>
                <label>Asset</label>
                <select value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)}>
                    {supportedAssets.map(asset => <option key={asset} value={asset}>{asset}</option>)}
                </select>
            </div>
        </div>
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
          {terminalMode === 'PAYMENT' ? `Charge ${amount} ${fiatCurrency}` : `Withdraw ${amount} ${selectedAsset}`}
        </button>
      </div>
    </div>
  );
}
export default PaymentTerminal;
