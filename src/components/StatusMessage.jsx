import React from 'react';
import { useTerminal } from '../providers/TerminalProvider';

// Using default export to prevent import errors
export default function StatusMessage() {
  const { status } = useTerminal();

  if (!status || !status.message) {
    return null;
  }

  return (
    <p className="status-message">{status.message}</p>
  );
}
