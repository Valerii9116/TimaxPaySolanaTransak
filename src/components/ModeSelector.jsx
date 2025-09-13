import React from 'react';
import { useTerminal } from '../providers/TerminalProvider';

export const ModeSelector = () => {
  const { mode, setMode } = useTerminal();

  const modes = [
    { id: 'ACCEPT_CRYPTO', label: 'Accept Crypto' },
    { id: 'ACCEPT_FIAT', label: 'Accept Fiat' },
    { id: 'SEND_CRYPTO', label: 'Send Crypto' },
    { id: 'WITHDRAW', label: 'Withdraw' },
  ];

  return (
    <div className="mode-selector">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          className={mode === m.id ? 'active' : ''}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
};