import React from 'react';
import PropTypes from 'prop-types';
import transakSDK from '@transak/transak-sdk';
import { useConfig } from '../../providers/ConfigProvider';
import { useTerminal } from '../../providers/TerminalProvider';
import { TRANSAK_NETWORK_MAP } from '../../config';

const Withdraw = ({ merchantAddress }) => {
  const { transakApiKey } = useConfig();
  const { selectedChain, selectedAsset, amount, setAmount, setAppStatus } = useTerminal();

  const launchTransakOffRamp = () => {
    if (!transakApiKey || !merchantAddress) {
      setAppStatus('Configuration or wallet address is missing.', 'error');
      return;
    }
    
    const transak = new transakSDK({
      apiKey: transakApiKey,
      environment: 'STAGING',
      productsAvailed: 'SELL', // Explicitly lock to SELL
      walletAddress: merchantAddress,
      cryptoCurrencyCode: selectedAsset,
      network: TRANSAK_NETWORK_MAP[selectedChain.id],
      cryptoAmount: amount ? parseFloat(amount) : undefined,
      themeColor: '1e1e1e',
    });
    
    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
      setAppStatus(`Off-ramp order successful! Status: ${orderData.status}`, 'success');
      transak.close();
    });

    transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
      setAppStatus('Transak widget closed.', 'info');
    });

    transak.init();
  };

  return (
    <div className="terminal-body">
      <h3>Withdraw {selectedAsset}</h3>
      <div className="amount-input-container">
        <input type="number" className="amount-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" />
      </div>
      <button onClick={launchTransakOffRamp} className="launch-button" disabled={!merchantAddress}>
        Withdraw Funds
      </button>
    </div>
  );
};

Withdraw.propTypes = {
  merchantAddress: PropTypes.string,
};

export default Withdraw;

