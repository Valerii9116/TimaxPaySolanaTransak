import React from 'react';
import PropTypes from 'prop-types';
import { ConfigProvider } from './ConfigProvider';
import { WalletProviders } from './WalletProviders';

// This component composes all providers into one for a cleaner main.jsx
export const AppProviders = ({ children }) => {
  return (
    <ConfigProvider>
      <WalletProviders>{children}</WalletProviders>
    </ConfigProvider>
  );
};

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};