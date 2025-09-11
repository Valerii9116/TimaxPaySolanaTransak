import React from 'react';
import transakSDK from '@transak/transak-sdk';

function TransakComponent({ transakConfig }) {

  const launchTransak = () => {
    const transak = new transakSDK({
        apiKey: transakConfig.apiKey,
        environment: transakConfig.environment,
        // You can add other configuration options here as needed
        // For example:
        // walletAddress: 'YOUR_WALLET_ADDRESS', 
        // themeColor: '000000',
    });

    transak.init();
  };

  return (
    <div className="transak-widget">
      <button onClick={launchTransak}>Buy Crypto with Transak</button>
    </div>
  );
}

export default TransakComponent;

