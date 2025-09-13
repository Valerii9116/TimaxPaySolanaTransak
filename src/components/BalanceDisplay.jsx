import React, { useEffect } from 'react';
import { useBalance as useWagmiBalance } from 'wagmi';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useTerminal } from '../providers/TerminalProvider';
import { USDC_CONTRACTS } from '../config';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import PropTypes from 'prop-types';

const BalanceDisplay = ({ address }) => {
  const { selectedChain, selectedAsset, setBalance, balance } = useTerminal();
  const isEVM = selectedChain.chainType !== 'SOLANA';

  // EVM Balance Fetching
  const { data: evmBalanceData, isLoading: isEvmLoading } = useWagmiBalance({
    address: isEVM ? address : undefined,
    token: selectedAsset === 'USDC' ? USDC_CONTRACTS[selectedChain.id] : undefined,
    chainId: isEVM ? selectedChain.id : undefined,
    enabled: isEVM && !!address,
  });
  
  // Solana Balance Fetching
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [isSolanaLoading, setSolanaLoading] = React.useState(false);

  useEffect(() => {
    if (isEVM && evmBalanceData) {
      setBalance({
        formatted: parseFloat(evmBalanceData.formatted).toFixed(4),
        symbol: evmBalanceData.symbol,
      });
    }
  }, [isEVM, evmBalanceData, setBalance]);

  useEffect(() => {
    const fetchSolanaBalance = async () => {
      if (!isEVM && publicKey && connection) {
        setSolanaLoading(true);
        try {
          if (selectedAsset === 'SOL') {
            const lamports = await connection.getBalance(publicKey);
            setBalance({
              formatted: (lamports / LAMPORTS_PER_SOL).toFixed(4),
              symbol: 'SOL',
            });
          } else if (selectedAsset === 'USDC') {
            const usdcMint = new PublicKey(USDC_CONTRACTS.solana);
            const associatedTokenAccount = await getAssociatedTokenAddress(usdcMint, publicKey);
            const accountInfo = await getAccount(connection, associatedTokenAccount);
            setBalance({
              formatted: (Number(accountInfo.amount) / 1e6).toFixed(4), // USDC has 6 decimals
              symbol: 'USDC',
            });
          }
        } catch (error) {
          console.error("Failed to fetch Solana balance:", error);
          setBalance({ formatted: '0.0', symbol: selectedAsset });
        } finally {
          setSolanaLoading(false);
        }
      }
    };
    fetchSolanaBalance();
  }, [isEVM, publicKey, connection, selectedAsset, setBalance]);
  
  const isLoading = isEvmLoading || isSolanaLoading;

  return (
    <div className="balance-display">
      {isLoading ? (
        <p>Fetching balance...</p>
      ) : (
        <p>{balance.formatted} <span>{balance.symbol}</span></p>
      )}
    </div>
  );
};

BalanceDisplay.propTypes = {
  address: PropTypes.string,
};

export default BalanceDisplay;
