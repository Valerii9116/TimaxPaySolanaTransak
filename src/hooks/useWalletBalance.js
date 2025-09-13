import { useState, useEffect } from 'react';
import { useBalance as useWagmiBalance } from 'wagmi';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { USDC_CONTRACTS, USDT_CONTRACTS, PYUSD_CONTRACTS } from '../config'; // Assuming RLUSD would be added here

const TOKEN_CONTRACT_MAP = {
    'USDC': USDC_CONTRACTS,
    'USDT': USDT_CONTRACTS,
    'PYUSD': PYUSD_CONTRACTS,
    // 'RLUSD': RLUSD_CONTRACTS,
};

export const useWalletBalance = (address, publicKey, selectedChain, selectedAsset) => {
    const [balance, setBalance] = useState({ formatted: '0.0000', symbol: selectedAsset });
    const [isLoading, setIsLoading] = useState(false);
    const isEVM = selectedChain.chainType !== 'SOLANA';

    // EVM Balance Hook
    const { data: evmBalanceData, isLoading: isEvmLoading } = useWagmiBalance({
        address: isEVM ? address : undefined,
        token: (isEVM && TOKEN_CONTRACT_MAP[selectedAsset]) ? TOKEN_CONTRACT_MAP[selectedAsset][selectedChain.id] : undefined,
        chainId: isEVM ? selectedChain.id : undefined,
        enabled: isEVM && !!address,
    });

    // Solana Balance Logic
    const { connection } = useConnection();

    useEffect(() => {
        const fetchSolanaBalance = async () => {
            if (!isEVM && publicKey && connection) {
                setIsLoading(true);
                try {
                    if (selectedAsset === 'SOL') {
                        const lamports = await connection.getBalance(publicKey);
                        setBalance({ formatted: (lamports / LAMPORTS_PER_SOL).toFixed(4), symbol: 'SOL' });
                    } else {
                        const tokenContracts = TOKEN_CONTRACT_MAP[selectedAsset];
                        if (tokenContracts && tokenContracts.solana) {
                            const mint = new PublicKey(tokenContracts.solana);
                            const tokenAccount = await getAssociatedTokenAddress(mint, publicKey);
                            const accountInfo = await getAccount(connection, tokenAccount);
                            const decimals = selectedAsset === 'USDC' ? 1e6 : 1e6; // Adjust decimals per token
                            setBalance({ formatted: (Number(accountInfo.amount) / decimals).toFixed(4), symbol: selectedAsset });
                        } else {
                           setBalance({ formatted: 'N/A', symbol: selectedAsset });
                        }
                    }
                } catch (error) {
                    console.warn(`Could not fetch Solana balance for ${selectedAsset}:`, error.message);
                    setBalance({ formatted: '0.0000', symbol: selectedAsset }); // Reset on error (e.g., no token account)
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchSolanaBalance();
    }, [isEVM, publicKey, connection, selectedAsset, setBalance]);

    useEffect(() => {
        if (isEVM && evmBalanceData) {
            setBalance({
                formatted: parseFloat(evmBalanceData.formatted).toFixed(4),
                symbol: evmBalanceData.symbol,
            });
        }
    }, [isEVM, evmBalanceData, setBalance]);

    return { balance, isLoading: isEVM ? isEvmLoading : isLoading };
};
