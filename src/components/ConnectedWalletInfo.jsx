import React from 'react';
import PropTypes from 'prop-types';
import { LogOut, ArrowRightLeft, Loader } from 'lucide-react';

const ConnectedWalletInfo = ({ address, onDisconnect, networkStatus, onSwitchNetwork, networkName, isSwitching, balance, isBalanceLoading }) => {
  return (
    <>
      <div className="connected-wallet-info">
        <p className="wallet-address">
          {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '...'}
        </p>
        <div className="wallet-actions">
          {networkStatus === 'mismatch' && (
            <button className="icon-button" onClick={onSwitchNetwork} title={`Switch to ${networkName}`} disabled={isSwitching}>
              {isSwitching ? <Loader size={16} className="loading-spinner" /> : <ArrowRightLeft size={16} />}
            </button>
          )}
          <button className="icon-button" onClick={onDisconnect} title="Disconnect">
            <LogOut size={16} />
          </button>
        </div>
      </div>
      <div className="balance-display">
        {isBalanceLoading ? (
            <p>Fetching balance...</p>
        ) : (
            <p>{balance.formatted} <span>{balance.symbol}</span></p>
        )}
      </div>
    </>
  );
};

ConnectedWalletInfo.propTypes = {
  address: PropTypes.string,
  onDisconnect: PropTypes.func.isRequired,
  networkStatus: PropTypes.oneOf(['ok', 'mismatch']).isRequired,
  onSwitchNetwork: PropTypes.func,
  networkName: PropTypes.string,
  isSwitching: PropTypes.bool,
  balance: PropTypes.shape({
    formatted: PropTypes.string,
    symbol: PropTypes.string,
  }),
  isBalanceLoading: PropTypes.bool,
};

export default ConnectedWalletInfo;

