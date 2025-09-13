import React from 'react';
import PropTypes from 'prop-types';
import transakSDK from '@transak/transak-sdk';
import { useConfig } from '../../providers/ConfigProvider';
import { useTerminal } from '../../providers/TerminalProvider';
import { TRANSAK_NETWORK_MAP } from '../../config';

const AcceptFiat = ({ merchantAddress }) => {
  const { transakApiKey } = useConfig();
  const { selectedChain, selectedAsset, amount, setAmount, setAppStatus } = useTerminal();

  const launchTransak = () => {
    if (!transakApiKey || !merchantAddress) {
      setAppStatus('Configuration or wallet address is missing.', 'error');
      return;
    }

    const transak = new transakSDK({
      apiKey: transakApiKey,
      environment: 'STAGING',
      productsAvailed: 'BUY', // Explicitly lock to BUY
      walletAddress: merchantAddress,
      cryptoCurrencyCode: selectedAsset,
      network: TRANSAK_NETWORK_MAP[selectedChain.id],
      fiatAmount: amount ? parseFloat(amount) : undefined,
      themeColor: '1e1e1e',
    });

    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
      setAppStatus(`On-ramp order successful! Status: ${orderData.status}`, 'success');
      transak.close();
    });

    transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
      setAppStatus('Transak widget closed.', 'info');
    });

    transak.init();
  };

  return (
    <div className="terminal-body">
      <h3>Enter Amount to Charge</h3>
        <div className="amount-input-container">
            <input type="number" className="amount-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 100" />
        </div>
        <button onClick={launchTransak} className="launch-button" disabled={!merchantAddress}>
            Charge Customer
        </button>
    </div>
  );
};

AcceptFiat.propTypes = {
  merchantAddress: PropTypes.string,
};

export default AcceptFiat;

