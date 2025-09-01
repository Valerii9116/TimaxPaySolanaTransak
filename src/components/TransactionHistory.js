import React from 'react';

// SVG icon for the external link
const ExternalLinkIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="external-link-icon"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);


function TransactionHistory({ transactions }) {

  const getExplorerLink = (hash) => {
    if (!hash) return null;
    return `https://polygonscan.com/tx/${hash}`;
  };

  const renderTransactionItem = (tx) => {
    const isPayment = tx.type === 'Payment';
    
    // Safely parse numbers to handle potential string values and format them
    const cryptoAmountParsed = parseFloat(tx.cryptoAmount);
    const fiatAmountParsed = parseFloat(tx.fiatAmount);

    const formattedCryptoAmount = !isNaN(cryptoAmountParsed) ? cryptoAmountParsed.toFixed(4) : 'N/A';
    const formattedFiatAmount = !isNaN(fiatAmountParsed) ? fiatAmountParsed.toFixed(2) : 'N/A';
    
    const spentText = isPayment 
      ? `Spent: ${formattedFiatAmount} ${tx.fiatCurrency}`
      : `Spent: ${formattedCryptoAmount} ${tx.cryptoCurrency}`;
      
    const receivedText = isPayment
      ? `Received: ${formattedCryptoAmount} ${tx.cryptoCurrency}`
      : `Received: ${formattedFiatAmount} ${tx.fiatCurrency}`;

    return (
      <li key={tx.id} className="transaction-item">
        <div className="transaction-icon">
          <div className={isPayment ? 'icon-credit' : 'icon-debit'}>
            {isPayment ? '↓' : '↑'}
          </div>
        </div>
        <div className="transaction-details">
          <span className="transaction-type">{isPayment ? 'Payment Received' : 'Withdrawal Processed'}</span>
          <span className="transaction-date">{new Date(tx.createdAt).toLocaleString()}</span>
          {tx.transactionHash && (
             <a href={getExplorerLink(tx.transactionHash)} target="_blank" rel="noopener noreferrer" className="explorer-link">
                View on PolygonScan <ExternalLinkIcon />
             </a>
          )}
        </div>
        <div className="transaction-amounts">
           <span className="transaction-flow-spent">{spentText}</span>
           <span className="transaction-flow-received">{receivedText}</span>
        </div>
      </li>
    );
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="step-card">
        <h3>Transaction History</h3>
        <div className="no-transactions-placeholder">
          <p>No transactions have been recorded in this session yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="step-card">
      <h3>Transaction History</h3>
      <ul className="transaction-list">
        {transactions.map(renderTransactionItem)}
      </ul>
    </div>
  );
}

export default TransactionHistory;

