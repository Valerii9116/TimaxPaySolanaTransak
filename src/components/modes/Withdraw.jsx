// ✅ COMPLETE Withdraw.jsx - Full Referrer Domain Implementation
// For TimaxPay domain: https://merch.timaxpay.com

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useConfig } from '../../providers/ConfigProvider';
import { useTerminal } from '../../providers/TerminalProvider';
import { TRANSAK_NETWORK_MAP } from '../../config';

const Withdraw = ({ merchantAddress }) => {
  const { transakApiKey } = useConfig();
  const { selectedChain, selectedAsset, amount, setAmount, setAppStatus } = useTerminal();
  const [isCreatingWidget, setIsCreatingWidget] = useState(false);
  const [currentPopup, setCurrentPopup] = useState(null);

  const createTransakWithdrawWidget = async () => {
    if (!transakApiKey || !merchantAddress) {
      setAppStatus('Configuration or wallet address is missing.', 'error');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setAppStatus('Please enter a valid withdrawal amount.', 'error');
      return;
    }

    setIsCreatingWidget(true);
    setAppStatus('Creating secure withdrawal widget for merch.timaxpay.com...', 'info');

    try {
      // Get current domain info
      const currentDomain = window.location.hostname;
      const isProduction = currentDomain === 'merch.timaxpay.com';
      
      // 🔥 COMPLETE widget configuration for SELL operation with referrer domain
      const widgetConfig = {
        // Required parameters for withdrawal/sell
        productsAvailed: 'SELL',
        walletAddress: merchantAddress,
        
        // Asset and network configuration
        cryptoCurrencyCode: selectedAsset,
        network: TRANSAK_NETWORK_MAP[selectedChain.id],
        cryptoAmount: parseFloat(amount),
        
        // 🔥 CRITICAL: Domain configuration for merch.timaxpay.com
        referrerDomain: 'merch.timaxpay.com',
        hostURL: 'https://merch.timaxpay.com',
        redirectURL: 'https://merch.timaxpay.com/',
        
        // UI configuration
        themeColor: '1e1e1e',
        hideMenu: true, // Simplified UI for withdrawal
        
        // Widget dimensions
        widgetHeight: '625px',
        widgetWidth: '450px',
        
        // Compliance parameters
        disableWalletAddressForm: true,
        
        // Withdrawal-specific parameters
        exchangeScreenTitle: 'TimaxPay - Withdraw to Bank Account',
        defaultPaymentMethod: 'bank_transfer',
        
        // Partner branding for TimaxPay
        partnerDisplayName: 'TimaxPay',
        partnerLogoUrl: 'https://merch.timaxpay.com/logo.png', // Add your logo URL
        
        // Additional UX parameters
        isAutoFillUserData: true, // Auto-fill if user has previous data
        isFeeCalculationHidden: false, // Show fees for transparency
        
        // Integration tracking
        integrationName: 'TimaxPay-Terminal-Withdraw',
        integrationVersion: '2.0.0',
        
        // Additional withdrawal-specific parameters
        isAddressEditable: false, // Lock the wallet address
        hideExchangeScreen: false, // Show exchange details
        disableWalletAddressForm: true, // Force use of provided address
      };

      console.log('Sending withdraw widget config for merch.timaxpay.com:', widgetConfig);

      // Call our backend API to create widget URL
      const response = await fetch('/api/createTransakWidget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add referrer headers for additional validation
          'X-Requested-With': 'TimaxPay-Terminal',
          'X-Domain': 'merch.timaxpay.com'
        },
        body: JSON.stringify(widgetConfig)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `API error: ${response.status}`);
      }

      const { widgetUrl, sessionId, referrerDomain } = result;
      
      console.log('Withdraw widget URL created for domain:', referrerDomain);
      setAppStatus('Opening secure withdrawal widget...', 'success');
      
      // Open widget in popup with proper configuration
      const popup = window.open(
        widgetUrl,
        'transakWithdrawWidget',
        'width=450,height=625,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for merch.timaxpay.com');
      }

      setCurrentPopup(popup);

      // Enhanced message handling for withdrawal with domain validation
      const handleMessage = (event) => {
        // Validate origin for security - updated for your domain context
        const allowedOrigins = [
          'https://global-staging.transak.com',
          'https://global.transak.com',
          'https://staging-global.transak.com'
        ];
        
        if (!allowedOrigins.includes(event.origin)) {
          console.warn('Message from unauthorized origin:', event.origin);
          return;
        }
        
        const eventData = event.data;
        console.log('Transak withdraw event for merch.timaxpay.com:', eventData);

        switch (eventData.event_id) {
          case 'TRANSAK_ORDER_SUCCESSFUL':
            setAppStatus(
              `✅ Withdrawal successful on TimaxPay! Funds will be transferred to your bank account. Order ID: ${eventData.data?.id || 'N/A'}`, 
              'success'
            );
            popup.close();
            setCurrentPopup(null);
            // Clear amount after successful withdrawal
            setAmount('');
            
            // Optional: Send success analytics
            if (window.gtag) {
              window.gtag('event', 'withdrawal_success', {
                transaction_id: eventData.data?.id,
                value: amount,
                currency: selectedAsset
              });
            }
            break;
            
          case 'TRANSAK_ORDER_FAILED':
            setAppStatus(
              `❌ Withdrawal failed: ${eventData.data?.message || 'Unknown error'}`, 
              'error'
            );
            break;
            
          case 'TRANSAK_ORDER_CANCELLED':
            setAppStatus('Withdrawal cancelled by customer', 'info');
            popup.close();
            setCurrentPopup(null);
            break;
            
          case 'TRANSAK_WIDGET_CLOSE':
            setAppStatus('Withdrawal widget closed', 'info');
            setCurrentPopup(null);
            break;
            
          case 'TRANSAK_WIDGET_OPEN':
            setAppStatus('TimaxPay withdrawal widget loaded successfully', 'success');
            break;
            
          case 'TRANSAK_ORDER_PROCESSING':
            setAppStatus('Withdrawal order is being processed...', 'info');
            break;
            
          case 'TRANSAK_ORDER_AWAITING_PAYMENT':
            setAppStatus('Withdrawal order created, awaiting final confirmation...', 'info');
            break;
            
          case 'TRANSAK_ORDER_PAYMENT_DONE':
            setAppStatus('Payment processed, withdrawal will be completed shortly...', 'success');
            break;
            
          default:
            console.log('Unhandled Transak withdrawal event:', eventData.event_id);
        }
      };

      // Add message listener
      window.addEventListener('message', handleMessage);
      
      // Monitor popup status
      const popupMonitor = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupMonitor);
          window.removeEventListener('message', handleMessage);
          setCurrentPopup(null);
          if (amount) { // Only show message if transaction wasn't successful
            setAppStatus('Withdrawal widget closed', 'info');
          }
        }
      }, 1000);

      // Auto-cleanup after 30 minutes (fail-safe)
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
        }
        clearInterval(popupMonitor);
        window.removeEventListener('message', handleMessage);
        setCurrentPopup(null);
      }, 30 * 60 * 1000);

    } catch (error) {
      console.error('Error creating Transak withdrawal widget for merch.timaxpay.com:', error);
      
      // Enhanced error messaging for domain-specific issues
      let errorMessage = error.message;
      if (error.message.includes('referrer domain')) {
        errorMessage = 'Domain verification failed. Please ensure merch.timaxpay.com is whitelisted with Transak for withdrawals.';
      } else if (error.message.includes('unauthorized')) {
        errorMessage = 'Domain authorization failed. Contact support to whitelist merch.timaxpay.com for SELL operations.';
      } else if (error.message.includes('SELL')) {
        errorMessage = 'Withdrawal service temporarily unavailable. Please try again or contact TimaxPay support.';
      }
      
      setAppStatus(`Failed to create withdrawal widget: ${errorMessage}`, 'error');
    } finally {
      setIsCreatingWidget(false);
    }
  };

  // Close current popup if user wants to start over
  const closeCurrentWidget = () => {
    if (currentPopup && !currentPopup.closed) {
      currentPopup.close();
      setCurrentPopup(null);
      setAppStatus('Withdrawal widget closed', 'info');
    }
  };

  return (
    <div className="terminal-body">
      <div className="timaxpay-branding">
        <h3>Withdraw {selectedAsset} to Bank Account</h3>
        <p className="domain-info">Secure withdrawals powered by TimaxPay (merch.timaxpay.com)</p>
      </div>
      
      <div className="amount-input-container">
        <input 
          type="number" 
          className="amount-input" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="Enter withdrawal amount"
          step="0.01"
          min="0.01"
          disabled={isCreatingWidget}
          required
        />
        <div className="currency-select">
          {selectedAsset}
        </div>
      </div>

      <div className="widget-controls">
        {!currentPopup ? (
          <button 
            onClick={createTransakWithdrawWidget} 
            className="launch-button timaxpay-button"
            disabled={!merchantAddress || !amount || parseFloat(amount) <= 0 || isCreatingWidget}
          >
            {isCreatingWidget ? (
              <>
                <span className="loading-spinner"></span>
                Creating Secure Widget...
              </>
            ) : (
              '🏦 Start Withdrawal Process'
            )}
          </button>
        ) : (
          <button 
            onClick={closeCurrentWidget} 
            className="launch-button secondary"
          >
            Close Current Widget
          </button>
        )}
      </div>

      <div className="withdrawal-info timaxpay-info">
        <h4>TimaxPay Withdrawal Information</h4>
        <ul>
          <li>✅ Secure API-based withdrawal (merch.timaxpay.com)</li>
          <li>🏦 Direct bank transfer support worldwide</li>
          <li>⏱️ Processing time: 1-5 business days</li>
          <li>🔒 KYC verification required for compliance</li>
          <li>💰 Competitive exchange rates</li>
          <li>📱 SMS/Email notifications for status updates</li>
          <li>📞 TimaxPay customer support available</li>
        </ul>
        
        <div className="withdrawal-notes">
          <h5>Important Notes for TimaxPay Merchants:</h5>
          <ul>
            <li>✓ Minimum withdrawal amounts vary by region and currency</li>
            <li>✓ Bank account must be in the same name as your TimaxPay account</li>
            <li>✓ Additional verification may be required for large amounts</li>
            <li>✓ Withdrawal fees apply based on payment method and region</li>
            <li>✓ All transactions are secured through merch.timaxpay.com</li>
            <li>✓ Transaction history available in your TimaxPay dashboard</li>
          </ul>
        </div>

        <div className="withdrawal-support">
          <p><strong>Need Help?</strong></p>
          <p>Contact TimaxPay support for withdrawal assistance or domain-related issues.</p>
        </div>
      </div>
    </div>
  );
};

Withdraw.propTypes = {
  merchantAddress: PropTypes.string,
};

export default Withdraw;