import React from 'react';

function TransactionStatus({ status }) {
  if (!status) return null;

  return (
    <div className="transaction-status">
      <p>Status: {status}</p>
    </div>
  );
}

export default TransactionStatus;

