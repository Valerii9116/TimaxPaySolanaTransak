import { useState, useEffect } from 'react';
import { useBalance as useWagmiBalance } from 'wagmi';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { formatUnits } from 'viem';

/**
 * A custom hook to fetch the balance of a given asset for both EVM and Solana wallets.
 * @param {object} wallet The connected wallet object.
 * @param {object} selectedChain The currently selected chain configuration.
 * @param {string} selectedAsset The symbol of the asset to fetch the balance for.
 * @returns {{balance: string, loading: boolean, error: string | null}}
 */
export const useBalance = (wallet, selectedChain, selectedAsset) => {
    const [balance, setBalance] = useState('0.00');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Wagmi hook for EVM balances
    const { data: evmBalance, isLoading: isEvmLoading, error: evmError } = useWagmiBalance({
        address: wallet?.type === 'EVM' ? wallet.address : undefined,
        chainId: wallet?.type === 'EVM' ? selectedChain.id : undefined,
        // We can add token addresses here for ERC20 tokens in the future
    });

    // Solana connection hook
    const { connection } = useConnection();

    useEffect(() => {
        const fetchBalance = async () => {
            if (!wallet || !selectedChain) return;

            setLoading(true);
            setError(null);

            try {
                if (wallet.type === 'EVM') {
                    if (isEvmLoading) return;
                    if (evmError) throw new Error(evmError.message);
                    if (evmBalance) {
                        const formatted = formatUnits(evmBalance.value, evmBalance.decimals);
                        setBalance(formatted);
                    }
                } else if (wallet.type === 'SOLANA') {
                    const publicKey = new PublicKey(wallet.address);
                    const solBalance = await connection.getBalance(publicKey);
                    // SOL has 9 decimals (1 SOL = 1,000,000,000 LAMports)
                    const formatted = formatUnits(BigInt(solBalance), 9);
                    setBalance(formatted);
                }
            } catch (err) {
                console.error('Failed to fetch balance:', err);
                setError(err.message || 'Error fetching balance');
                setBalance('0.00');
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, [wallet, selectedChain, selectedAsset, evmBalance, isEvmLoading, evmError, connection]);

    return { balance, loading, error };
};
