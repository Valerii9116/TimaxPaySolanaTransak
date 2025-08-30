import React from 'react';

// SVG Icons for transaction status
const SuccessIcon = () => (
  <svg className="status-icon success" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4CAF50"/>
  </svg>
);

const TransactionItem = ({ tx }) => {
  const isPayment = tx.type === 'Payment';
  const amount = isPayment 
    ? `${tx.fiatAmount} ${tx.fiatCurrency}` 
    : `${tx.cryptoAmount} ${tx.cryptoCurrency}`;
  const title = isPayment ? `Payment from Customer` : `Withdrawal to Wallet`;

  return (
    <div className="history-item">
      <div className="history-item-icon">
        <SuccessIcon />
      </div>
      <div className="history-item-details">
        <span className="history-item-title">{title}</span>
        <span className="history-item-id">ID: {tx.id.substring(0, 16)}...</span>
      </div>
      <div className="history-item-amount">
        <span className={isPayment ? 'amount-positive' : 'amount-negative'}>
          {isPayment ? '+' : '-'} {amount}
        </span>
        <a 
          href={`https://polygonscan.com/tx/${tx.transactionHash}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="history-item-explorer"
        >
          View on Explorer
        </a>
      </div>
    </div>
  );
};

function TransactionHistory({ transactions }) {
  return (
    <div className="step-card history-container">
      <h3>Transaction History</h3>
      {transactions && transactions.length > 0 ? (
        <div className="history-list">
          {transactions.map(tx => <TransactionItem key={tx.id} tx={tx} />)}
        </div>
      ) : (
        <div className="history-list-placeholder">
          <p>Your recent transactions will appear here.</p>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;

