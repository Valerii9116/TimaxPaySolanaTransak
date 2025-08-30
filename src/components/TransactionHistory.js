import React, { useState } from 'react';

function TransactionHistory({ merchantAddress }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/getTransactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerCustomerId: merchantAddress }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch transaction history.');
      }
      
      const data = await response.json();
      setTransactions(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="step-card">
      <h3>Transaction History</h3>
      <button onClick={fetchHistory} disabled={isLoading} className="launch-button">
        {isLoading ? 'Refreshing...' : 'Refresh History'}
      </button>
      {error && <p className="error-message">{error}</p>}
      <div className="history-table-container">
        {transactions.length > 0 ? (
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td>{tx.status}</td>
                  <td>{tx.fiatAmount} {tx.fiatCurrency}</td>
                  <td>{tx.isBuyOrSell}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !isLoading && <p>No transactions found.</p>
        )}
      </div>
    </div>
  );
}

export default TransactionHistory;