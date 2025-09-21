// FIXED Bridge.jsx - Proper error handling and fee integration
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAccount, useSendTransaction, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useTerminal } from '../../providers/TerminalProvider';
import { ArrowUpDown, ExternalLink, Wallet } from 'lucide-react';

const Bridge = ({ merchantAddress }) => {
  const { setAppStatus } = useTerminal();
  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState('1'); // Ethereum
  const [toChain, setToChain] = useState('137'); // Polygon
  const [fromToken, setFromToken] = useState('0x0000000000000000000000000000000000000000'); // ETH
  const [toToken, setToToken] = useState('0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'); // USDC Polygon
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableChains, setAvailableChains] = useState([]);
  const [availableTokens, setAvailableTokens] = useState({});

  // Wagmi hooks
  const { address, chainId } = useAccount();
  const { sendTransaction, data: hash, isPending, error: txError } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // LI.FI Configuration with proper fee structure
  const LIFI_CONFIG = {
    API_URL: 'https://li.quest/v1',
    INTEGRATOR: 'Timax_swap',
    FEE_PERCENTAGE: 0.005, // 0.5% as number, not string
    FEE_RECIPIENT: '0x34accc793fD8C2A8e262C8C95b18D706bc6022f0' // Your fee address
  };

  // Load chains and tokens from LI.FI
  const loadChainsAndTokens = useCallback(async () => {
    setIsLoading(true);
    try {
      const [chainsResponse, tokensResponse] = await Promise.all([
        fetch(`${LIFI_CONFIG.API_URL}/chains`),
        fetch(`${LIFI_CONFIG.API_URL}/tokens`)
      ]);

      if (!chainsResponse.ok || !tokensResponse.ok) {
        throw new Error('Failed to fetch LI.FI data');
      }

      const { chains } = await chainsResponse.json();
      const { tokens } = await tokensResponse.json();
      
      // Filter to supported chains only
      const supportedChainIds = [1, 137, 42161, 8453, 43114, 10, 56];
      const filteredChains = chains.filter(chain => supportedChainIds.includes(chain.id));
      
      setAvailableChains(filteredChains);
      setAvailableTokens(tokens);
      setAppStatus('Bridge data loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to load bridge data:', error);
      setAppStatus('Failed to load bridge data. Please refresh.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [setAppStatus]);

  useEffect(() => {
    loadChainsAndTokens();
  }, [loadChainsAndTokens]);

  // Get quote from LI.FI
  const getQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setAppStatus('Please enter a valid amount', 'error');
      return;
    }

    if (!address) {
      setAppStatus('Please connect your wallet', 'error');
      return;
    }

    setIsLoading(true);
    setAppStatus('Getting bridge quote...', 'info');

    try {
      const fromTokenData = availableTokens[fromChain]?.find(t => t.address === fromToken);
      if (!fromTokenData) {
        throw new Error('From token not found');
      }

      const fromAmount = parseUnits(amount, fromTokenData.decimals).toString();

      const params = new URLSearchParams({
        fromChain,
        toChain,
        fromToken,
        toToken,
        fromAmount,
        fromAddress: address,
        // FIXED: Use proper destination address handling
        ...(merchantAddress && { toAddress: merchantAddress }),
        integrator: LIFI_CONFIG.INTEGRATOR,
        // FIXED: Convert fee to string for API
        fee: LIFI_CONFIG.FEE_PERCENTAGE.toString(),
        referrer: LIFI_CONFIG.FEE_RECIPIENT
      });

      console.log('LI.FI request params:', params.toString());

      const response = await fetch(`${LIFI_CONFIG.API_URL}/quote?${params}`);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`LI.FI API error: ${response.status} - ${errorData}`);
      }

      const quoteData = await response.json();
      console.log('LI.FI quote response:', quoteData);

      if (!quoteData.estimate) {
        throw new Error('Invalid quote response from LI.FI');
      }

      setQuote(quoteData);
      setAppStatus('Quote received successfully', 'success');

    } catch (error) {
      console.error('Bridge quote error:', error);
      setAppStatus(`Quote failed: ${error.message}`, 'error');
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute bridge transaction
  const executeBridge = async () => {
    if (!quote?.transactionRequest) {
      setAppStatus('No valid quote available', 'error');
      return;
    }

    // Check if we need to switch networks
    if (chainId !== parseInt(fromChain)) {
      try {
        setAppStatus('Switching to source network...', 'info');
        await switchChain({ chainId: parseInt(fromChain) });
        setAppStatus('Network switched, preparing transaction...', 'info');
      } catch (error) {
        console.error('Network switch failed:', error);
        setAppStatus('Failed to switch network. Please switch manually.', 'error');
        return;
      }
    }

    try {
      setAppStatus('Please confirm transaction in your wallet...', 'info');
      
      const tx = quote.transactionRequest;
      
      // FIXED: Proper transaction format
      await sendTransaction({
        to: tx.to,
        value: tx.value || '0x0',
        data: tx.data || '0x',
        ...(tx.gasLimit && { gas: tx.gasLimit }),
        ...(tx.gasPrice && { gasPrice: tx.gasPrice })
      });

    } catch (error) {
      console.error('Transaction failed:', error);
      setAppStatus(`Transaction failed: ${error.shortMessage || error.message}`, 'error');
    }
  };

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash) {
      setAppStatus(`Bridge completed! Transaction: ${hash.slice(0, 10)}...`, 'success');
      // Reset form
      setAmount('');
      setQuote(null);
    }
  }, [isSuccess, hash, setAppStatus]);

  // Handle transaction errors
  useEffect(() => {
    if (txError) {
      setAppStatus(`Transaction error: ${txError.shortMessage || txError.message}`, 'error');
    }
  }, [txError, setAppStatus]);

  // Swap chains and tokens
  const swapChains = () => {
    const tempChain = fromChain;
    const tempToken = fromToken;
    setFromChain(toChain);
    setToChain(tempChain);
    setFromToken(toToken);
    setToToken(tempToken);
    setQuote(null);
    setAppStatus('Swapped source and destination', 'info');
  };

  // Get available tokens for a chain
  const getTokensForChain = (chainId) => {
    return availableTokens[chainId] || [];
  };

  if (isLoading && availableChains.length === 0) {
    return (
      <div className="bridge-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading bridge data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bridge-container">
      <h3>Cross-Chain Bridge</h3>
      <p className="bridge-description">
        Bridge tokens with {(LIFI_CONFIG.FEE_PERCENTAGE * 100)}% TimaxPay fee
      </p>

      {address && (
        <div className="wallet-info">
          <Wallet size={16} />
          <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
        </div>
      )}

      {/* From Section */}
      <div className="bridge-section">
        <label>From</label>
        <div className="bridge-input-group">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setQuote(null);
            }}
            placeholder="0.0"
            className="bridge-amount-input"
            min="0"
            step="0.000001"
          />
          <select
            value={fromToken}
            onChange={(e) => {
              setFromToken(e.target.value);
              setQuote(null);
            }}
            className="bridge-token-select"
          >
            {getTokensForChain(fromChain).slice(0, 20).map(token => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
        <select
          value={fromChain}
          onChange={(e) => {
            setFromChain(e.target.value);
            setQuote(null);
          }}
          className="bridge-chain-select"
        >
          {availableChains.map(chain => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </select>
      </div>

      {/* Swap Button */}
      <div className="bridge-swap-container">
        <button onClick={swapChains} className="bridge-swap-button">
          <ArrowUpDown size={20} />
        </button>
      </div>

      {/* To Section */}
      <div className="bridge-section">
        <label>To</label>
        <div className="bridge-input-group">
          <input
            type="text"
            value={quote ? formatUnits(BigInt(quote.estimate.toAmount), quote.estimate.toToken.decimals) : '0.0'}
            disabled
            className="bridge-amount-input disabled"
          />
          <select
            value={toToken}
            onChange={(e) => {
              setToToken(e.target.value);
              setQuote(null);
            }}
            className="bridge-token-select"
          >
            {getTokensForChain(toChain).slice(0, 20).map(token => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
        <select
          value={toChain}
          onChange={(e) => {
            setToChain(e.target.value);
            setQuote(null);
          }}
          className="bridge-chain-select"
        >
          {availableChains.map(chain => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </select>
      </div>

      {/* Quote Display */}
      {quote && (
        <div className="bridge-quote-info">
          <h4>Bridge Quote</h4>
          <div className="quote-details">
            <div className="quote-row">
              <span>Estimated Output:</span>
              <span>
                {formatUnits(BigInt(quote.estimate.toAmount), quote.estimate.toToken.decimals)}{' '}
                {quote.estimate.toToken.symbol}
              </span>
            </div>
            <div className="quote-row">
              <span>Gas Cost:</span>
              <span>~${quote.estimate.gasCosts?.[0]?.amountUSD || '0'}</span>
            </div>
            <div className="quote-row">
              <span>TimaxPay Fee:</span>
              <span>~${quote.estimate.feeCosts?.[0]?.amountUSD || '0'}</span>
            </div>
            <div className="quote-row">
              <span>Bridge:</span>
              <span>{quote.toolDetails?.name || 'Multi-protocol'}</span>
            </div>
            <div className="quote-row">
              <span>Est. Time:</span>
              <span>{Math.ceil((quote.estimate.executionDuration || 300) / 60)} min</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="bridge-actions">
        {!quote ? (
          <button
            onClick={getQuote}
            disabled={isLoading || !amount || !address}
            className="bridge-button primary"
          >
            {isLoading ? 'Getting Quote...' : 'Get Bridge Quote'}
          </button>
        ) : (
          <button
            onClick={executeBridge}
            disabled={isPending || isConfirming}
            className="bridge-button primary"
          >
            {isPending
              ? 'Confirm in Wallet...'
              : isConfirming
              ? 'Processing...'
              : chainId !== parseInt(fromChain)
              ? 'Switch Network & Bridge'
              : 'Execute Bridge'
            }
          </button>
        )}

        <a
          href="https://li.fi"
          target="_blank"
          rel="noopener noreferrer"
          className="bridge-button secondary"
        >
          <ExternalLink size={16} />
          Powered by LI.FI
        </a>
      </div>
    </div>
  );
};

Bridge.propTypes = {
  merchantAddress: PropTypes.string,
};

export default Bridge;