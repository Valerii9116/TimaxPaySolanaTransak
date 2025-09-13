import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { useTerminal } from '../providers/TerminalProvider';
import { ClipLoader } from 'react-spinners';

export const EVMWalletConnector = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { selectedChain } = useTerminal();
  const currentChainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  // This stable logic replaces the problematic useEffect hook
  let buttonText;
  let buttonAction;
  let isLoading = isConnecting || isSwitching;

  if (isConnecting) {
    buttonText = 'Connecting...';
  } else if (isConnected) {
    const isWrongNetwork = currentChainId !== selectedChain.id;
    if (isWrongNetwork) {
      buttonText = isSwitching ? 'Switching...' : `Switch Network`;
      buttonAction = () => switchChain({ chainId: selectedChain.id });
    } else {
      buttonText = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
      buttonAction = () => disconnect();
    }
  } else {
    buttonText = 'Connect EVM Wallet';
    buttonAction = () => open();
  }

  return (
    <button onClick={buttonAction} disabled={isLoading} className={isConnected ? 'secondary' : 'primary'}>
      {isLoading ? <ClipLoader color={isConnected ? '#5856d6' : '#fff'} size={14} speedMultiplier={0.7} /> : buttonText}
    </button>
  );
};