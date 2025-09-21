// FIXED AcceptFiat.jsx - Enhanced error handling and proper domain integration
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useConfig } from '../../providers/ConfigProvider';
import { useTerminal } from '../../providers/TerminalProvider';
import { TRANSAK_NETWORK_MAP } from '../../config';

const AcceptFiat = ({ merchantAddress }) => {
  const { transakApiKey } = useConfig();
  const { selectedChain, selectedAsset, amount, setAmount, setAppStatus } = useTerminal();
  const [isCreatingWidget, setIsCreatingWidget] = useState(false);
  const [currentPopup, setCurrentPopup] = useState(null);

  const createTransakWidget = async () => {
    if (!transakApiKey || !merchantAddress) {
      setAppStatus('Configuration missing: API key or wallet address not available', 'error');
      return;
    }

    // Validate selected chain is supported by Transak
    const networkName = TRANSAK_NETWORK_MAP[selectedChain.id];
    if (!networkName) {
      setAppStatus(`Network ${selectedChain.name} is not supported by Transak`, 'error');
      return;
    }

    setIsCreatingWidget(true);
    setAppStatus('Creating secure Transak widget...', 'info');

    try {
      // Prepare widget configuration with all required fields
      const widgetConfig = {
        // Core Transak parameters
        productsAvailed: 'BUY',
        walletAddress: merchantAddress,
        cryptoCurrencyCode: selectedAsset,
        network: networkName,
        
        // Domain configuration for merch.timaxpay.com
        referrerDomain: 'merch.timaxpay.com',
        hostURL: 'https://merch.timaxpay.com',
        redirectURL: 'https://merch.timaxpay.com/success',
        
        // UI customization
        themeColor: '1e1e1e',
        hideMenu: false,
        widgetHeight: '625px',
        widgetWidth: '450px',
        
        // UX parameters
        disableWalletAddressForm: true,
        defaultPaymentMethod: 'credit_debit_card',
        exchangeScreenTitle: 'TimaxPay - Buy Cryptocurrency',
        partnerDisplayName: 'TimaxPay',
        
        // Optional amount
        ...(amount && parseFloat(amount) > 0 && { 
          fiatAmount: parseFloat(amount) 
        })
      };

      console.log('Creating Transak widget with config:', {
        ...widgetConfig,
        // Hide sensitive data in logs
        walletAddress: `${merchantAddress.slice(0, 6)}...${merchantAddress.slice(-4)}`
      });

      // Call backend API
      const response = await fetch('/api/createTransakWidget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'TimaxPay-Terminal',
          'X-Domain': 'merch.timaxpay.com'
        },
        body: JSON.stringify(widgetConfig)
      });

      // Enhanced error handling
      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          
          if (errorData.debug) {
            console.error('Debug info:', errorData.debug);
          }
          
          // Specific error messages based on common issues
          if (response.status === 500) {
            if (errorMessage.includes('credentials')) {
              errorMessage = 'Invalid Transak API credentials. Please check configuration.';
            } else if (errorMessage.includes('whitelist')) {
              errorMessage = 'Domain merch.timaxpay.com not whitelisted. Contact Transak support.';
            } else {
              errorMessage = 'Server configuration error. Check API setup.';
            }
          }
        } catch (parseError) {
          const errorText = await response.text();
          console.error('Raw error response:', errorText);
          errorMessage = `Server error: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create widget URL');
      }

      const { widgetUrl, sessionId } = result;
      console.log('Widget URL created successfully, session:', sessionId);
      
      setAppStatus('Opening Transak payment widget...', 'success');
      
      // Open widget in popup with proper window features
      const popup = window.open(
        widgetUrl,
        'transakWidget',
        'width=450,height=625,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
      );

      if (!popup) {
        throw new Error('Popup blocked - please allow popups for merch.timaxpay.com');
      }

      setCurrentPopup(popup);

      // Enhanced message handling with proper origin validation
      const handleMessage = (event) => {
        const allowedOrigins = [
          'https://global-staging.transak.com',
          'https://global.transak.com',
          'https://staging-global.transak.com'
        ];
        
        if (!allowedOrigins.includes(event.origin)) {
          console.warn('Blocked message from unauthorized origin:', event.origin);
          return;
        }
        
        const eventData = event.data;
        console.log('Transak widget event:', eventData);

        switch (eventData.event_id) {
          case 'TRANSAK_ORDER_SUCCESSFUL':
            const orderId = eventData.data?.id || 'N/A';
            const orderAmount = eventData.data?.fiatAmount || amount;
            setAppStatus(
              `Payment successful! Order ${orderId} for ${orderAmount} ${eventData.data?.fiatCurrency || 'USD'}`, 
              'success'
            );
            popup.close();
            setCurrentPopup(null);
            setAmount(''); // Clear form
            
            // Optional analytics tracking
            if (window.gtag) {
              window.gtag('event', 'purchase', {
                transaction_id: orderId,
                value: orderAmount,
                currency: 'USD'
              });
            }
            break;
            
          case 'TRANSAK_ORDER_FAILED':
            const errorMsg = eventData.data?.message || 'Unknown error occurred';
            setAppStatus(`Payment failed: ${errorMsg}`, 'error');
            break;
            
          case 'TRANSAK_ORDER_CANCELLED':
            setAppStatus('Payment cancelled by user', 'info');
            popup.close();
            setCurrentPopup(null);
            break;
            
          case 'TRANSAK_WIDGET_CLOSE':
            setAppStatus('Payment widget closed', 'info');
            setCurrentPopup(null);
            break;
            
          case 'TRANSAK_WIDGET_OPEN':
            setAppStatus('Payment widget loaded successfully', 'success');
            break;
            
          default:
            console.log('Unhandled Transak event:', eventData.event_id, eventData);
        }
      };

      // Add message event listener
      window.addEventListener('message', handleMessage);
      
      // Monitor popup status
      const popupMonitor = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupMonitor);
          window.removeEventListener('message', handleMessage);
          setCurrentPopup(null);
          if (!amount) { // Only show close message if payment wasn't successful
            setAppStatus('Payment widget closed', 'info');
          }
        }
      }, 1000);

      // Auto-cleanup after 45 minutes (safety net)
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
        }
        clearInterval(popupMonitor);
        window.removeEventListener('message', handleMessage);
        setCurrentPopup(null);
      }, 45 * 60 * 1000);

    } catch (error) {
      console.error('Error creating Transak widget:', error);
      setAppStatus(`Failed to create payment widget: ${error.message}`, 'error');
    } finally {
      setIsCreatingWidget(false);
    }
  };

  const closeCurrentWidget = () => {
    if (currentPopup && !currentPopup.closed) {
      currentPopup.close();
      setCurrentPopup(null);
      setAppStatus('Payment widget closed', 'info');
    }
  };

  return (
    <div className="terminal-body">
      <div className="payment-header">
        <h3>Accept Fiat Payment</h3>
        <p className="payment-subtitle">
          Network: <strong>{selectedChain.name}</strong> | 
          Asset: <strong>{selectedAsset}</strong>
        </p>
      </div>
      
      <div className="amount-input-container">
        <input 
          type="number" 
          className="amount-input" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="Enter amount (optional)"
          min="0"
          step="0.01"
          disabled={isCreatingWidget}
        />
        <div className="currency-select">USD</div>
      </div>

      <div className="payment-controls">
        {!currentPopup ? (
          <button 
            onClick={createTransakWidget} 
            className="launch-button primary"
            disabled={!merchantAddress || isCreatingWidget}
          >
            {isCreatingWidget ? (
              <>
                <span className="loading-spinner"></span>
                Creating Widget...
              </>
            ) : (
              'Start Payment Process'
            )}
          </button>
        ) : (
          <button 
            onClick={closeCurrentWidget} 
            className="launch-button secondary"
          >
            Close Payment Widget
          </button>
        )}
      </div>

      <div className="payment-info">
        <h4>Payment Information</h4>
        <ul>
          <li>Secure fiat-to-crypto conversion via Transak</li>
          <li>Credit card, debit card, and bank transfer supported</li>
          <li>Available in 100+ countries worldwide</li>
          <li>KYC verification required for compliance</li>
          <li>Instant delivery to your connected wallet</li>
        </ul>
      </div>
    </div>
  );
};

AcceptFiat.propTypes = {
  merchantAddress: PropTypes.string,
};

export default AcceptFiat;