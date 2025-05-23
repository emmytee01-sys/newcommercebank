import React, { useEffect, useState } from 'react';

type Transaction = {
  date?: string;
  type: string;
  amount: number;
  description?: string;
  from?: string;
  to?: string;
};

type Account = {
  accountNumber: string;
  accountType: string;
  status: string;
  currency: string;
  routingNumber: string;
  balance: number;
};

const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [showAddExternal, setShowAddExternal] = useState(false);
  const [showWireTransferModal, setShowWireTransferModal] = useState(false);

  // Form states
  const [transferForm, setTransferForm] = useState({ toAccount: '', amount: '', description: '' });
  const [depositForm, setDepositForm] = useState({ amount: '', description: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', description: '' });
  const [requestForm, setRequestForm] = useState({ fromAccount: '', amount: '', description: '' });
  const [externalForm, setExternalForm] = useState({ routingNumber: '', accountNumber: '' });
  const [wireForm, setWireForm] = useState({
    recipientName: '',
    recipientBank: '',
    recipientAccount: '',
    recipientRouting: '',
    bankSwift: '',
    bankAddress: '',
    recipientAddress: '',
    amount: '',
    description: '',
  });

  const [receiverDetails, setReceiverDetails] = useState<{ fullName: string; address: string } | null>(null);
  const [receiverWarning, setReceiverWarning] = useState('');
  const [receiverFetchError, setReceiverFetchError] = useState('');
  const [externalMessage, setExternalMessage] = useState('');
  const [wireMessage, setWireMessage] = useState('');

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const accRes = await fetch('https://newcommercebank.onrender.com/api/wallet/accounts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const accData = await accRes.json();

    // Defensive check
    if (accData && Array.isArray(accData.accounts) && accData.accounts.length > 0) {
      setAccounts(accData.accounts);
    } else {
      setAccounts([]);
    }

    // Fetch transactions
    try {
      const token = localStorage.getItem('token');
      const txRes = await fetch('https://newcommercebank.onrender.com/api/wallet/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (txRes.ok) {
        const txData = await txRes.json();
        if (txData && Array.isArray(txData.transactions)) {
          setTransactions(txData.transactions);
        } else {
          setTransactions([]);
        }
      } else {
        setTransactions([]);
      }
    } catch (error) {
      setTransactions([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  if (loading) return <div>Loading...</div>;

  // --- ACTION HANDLERS ---

  // Transfer Funds
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage('');
    const token = localStorage.getItem('token');
    const fromAccount = accounts[0].accountNumber;
    const res = await fetch('https://newcommercebank.onrender.com/api/wallet/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        fromAccount,
        toAccount: transferForm.toAccount,
        amount: Number(transferForm.amount),
        description: transferForm.description,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setActionMessage('Transfer successful!');
      setShowTransferModal(false);
      setTransferForm({ toAccount: '', amount: '', description: '' });
      fetchData();
    } else {
      setActionMessage(data.message || 'Transfer failed');
    }
  };

  // Add Money (Deposit)
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage('');
    const token = localStorage.getItem('token');
    const accountNumber = accounts[0].accountNumber;
    const res = await fetch('https://newcommercebank.onrender.com/api/wallet/credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        accountNumber,
        amount: Number(depositForm.amount),
        description: depositForm.description,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setActionMessage('Deposit successful!');
      setShowDepositModal(false);
      setDepositForm({ amount: '', description: '' });
      fetchData();
    } else {
      setActionMessage(data.message || 'Deposit failed');
    }
  };

  // Withdraw
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage('');
    const token = localStorage.getItem('token');
    const accountNumber = accounts[0].accountNumber;
    const res = await fetch('https://newcommercebank.onrender.com/api/wallet/debit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        accountNumber,
        amount: Number(withdrawForm.amount),
        description: withdrawForm.description,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setActionMessage('Withdrawal successful!');
      setShowWithdrawModal(false);
      setWithdrawForm({ amount: '', description: '' });
      fetchData();
    } else {
      setActionMessage(data.message || 'Withdrawal failed');
    }
  };

  // Request Payment
  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage('');
    const token = localStorage.getItem('token');
    const toAccount = accounts[0].accountNumber;
    const res = await fetch('https://newcommercebank.onrender.com/api/wallet/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        fromAccount: requestForm.fromAccount,
        toAccount,
        amount: Number(requestForm.amount),
        description: requestForm.description,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setActionMessage('Payment request sent!');
      setShowRequestModal(false);
      setRequestForm({ fromAccount: '', amount: '', description: '' });
      fetchData();
    } else {
      setActionMessage(data.message || 'Request failed');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Wire Transfer
  const handleWireTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setWireMessage('');
    const token = localStorage.getItem('token');
    const fromAccount = accounts[0]?.accountNumber;
    const res = await fetch('https://newcommercebank.onrender.com/api/wallet/wire-transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        fromAccount,
        ...wireForm,
        amount: Number(wireForm.amount),
      }),
    });
    // Always show the processing message, regardless of backend response
    setWireMessage(
      "Your wire transfer is being processed and confirmed by the bank. We’ll send you an email if it has been processed successfully."
    );
    setShowWireTransferModal(false);
    setWireForm({
      recipientName: '',
      recipientBank: '',
      recipientAccount: '',
      recipientRouting: '',
      bankSwift: '',
      bankAddress: '',
      recipientAddress: '',
      amount: '',
      description: '',
    });
    fetchData();
  };

  // Recipient account change handler
  const handleRecipientAccountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTransferForm({ ...transferForm, toAccount: value });
    setReceiverDetails(null);
    setReceiverWarning('');
    setReceiverFetchError('');

    if (value.length >= 6) { // Adjust length as needed
      try {
        const res = await fetch(`https://newcommercebank.onrender.com/api/accounts/${value}`);
        if (res.ok) {
          const data = await res.json();
          setReceiverDetails(data);
          setReceiverWarning('Please confirm the receiver details before sending money out.');
        } else {
          setReceiverFetchError('Account not found');
        }
      } catch {
        setReceiverFetchError('Error fetching account details');
      }
    }
  };

  // Handler for adding external account
  const handleAddExternalAccount = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    setExternalMessage(
      "Your external account has been added and 2 micro-deposits have been sent to your added account successfully. Kindly check again in 1-2 business days to verify the account once you get the 2 deposits."
    );
    setExternalForm({ routingNumber: '', accountNumber: '' });
    setShowAddExternal(false);
    setTimeout(() => setExternalMessage(''), 15000); // Hide message after 15s
  };

  // --- UI ---
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Left Navigation Bar */}
      <nav className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-blue-800">CommerceBank</div>
        <ul className="flex-1 p-4 space-y-4">
          <li>
            <a href="/dashboard/account-summary" className="block py-2 px-4 rounded hover:bg-blue-800">
              Account Summary
            </a>
          </li>
          <li>
            <a href="/dashboard/transfer-funds" className="block py-2 px-4 rounded hover:bg-blue-800">
              Transfer Funds
            </a>
          </li>
          <li>
            <a href="#" className="block py-2 px-4 rounded hover:bg-blue-800">
              Zelle/Bill Pay
            </a>
          </li>
          <li>
            <a href="/dashboard/transfer-funds" className="block py-2 px-4 rounded hover:bg-blue-800">
              Request Debit Card/Checkbook
            </a>
          </li>
          <li>
            <a href="/dashboard/manage-profile" className="block py-2 px-4 rounded hover:bg-blue-800">
              Manage Profile
            </a>
          </li>
        </ul>
        <div className="p-4 border-t border-blue-800">
          <button className="w-full bg-red-600 py-2 rounded hover:bg-red-700" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-blue-800 text-white py-6 px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">Total Balance</p>
            <p className="text-3xl font-bold">
              ${accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}
            </p>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8">
          {actionMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{actionMessage}</div>
          )}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setShowTransferModal(true)}
            >
              Transfer Funds
            </button>
            <button
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              onClick={() => setShowWithdrawModal(true)}
            >
              Withdraw
            </button>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              onClick={() => setShowRequestModal(true)}
            >
              Request Payment
            </button>
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
              onClick={() => setShowWireTransferModal(true)}
            >
              Wire Transfer
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* All Accounts Section */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4">Accounts Information</h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">Type</th>
                    <th className="py-2">Account Number</th>
                    <th className="py-2">Routing Number</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Currency</th>
                    <th className="py-2">Available Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(acc => (
                    <tr key={acc.accountNumber} className="border-b">
                      <td className="py-2">{acc.accountType}</td>
                      <td className="py-2">{acc.accountNumber}</td>
                      <td className="py-2">{acc.routingNumber}</td>
                      <td className="py-2">{acc.status}</td>
                      <td className="py-2">{acc.currency}</td>
                      <td className="py-2">${acc.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4">Recent Activity</h2>
              <ul className="space-y-4 text-sm">
                {transactions.slice(0, 5).map((tx, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>
                      [{tx.date?.slice(0, 10)}] {tx.type.toUpperCase()} {tx.description && `- ${tx.description}`}
                    </span>
                    <span className={tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                      {tx.type === 'credit' ? '+' : '-'}${tx.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Wallet Balance and Transaction History */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Wallet Balance and Transaction History</h2>
            <div>
              <h3 className="text-lg font-semibold">
                Available Balance: ${accounts.length > 0 ? accounts[0].balance.toLocaleString() : '0.00'}
              </h3>
              <h4 className="text-md font-semibold mt-4 mb-2">Transaction History</h4>
              <table className="min-w-full bg-white rounded shadow mt-2">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Date</th>
                    <th className="py-2 px-4 border-b text-left">Type</th>
                    <th className="py-2 px-4 border-b text-left">Amount</th>
                    <th className="py-2 px-4 border-b text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-gray-500">No transactions found.</td>
                    </tr>
                  ) : (
                    transactions.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{tx.date ? tx.date.slice(0, 10) : ''}</td>
                        <td className="py-2 px-4 border-b capitalize">{tx.type}</td>
                        <td className={`py-2 px-4 border-b font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'credit' ? '+' : '-'}${tx.amount}
                        </td>
                        <td className="py-2 px-4 border-b">{tx.description || ''}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Transfer Funds Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Transfer Funds</h2>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Recipient Account Number</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={transferForm.toAccount}
                  onChange={handleRecipientAccountChange}
                  required
                />
                {receiverDetails && (
                  <div className="mt-2 p-2 bg-gray-100 border rounded">
                    <div><strong>Receiver Name:</strong> {receiverDetails.fullName}</div>
                    <div><strong>Address:</strong> {receiverDetails.address}</div>
                    <div className="mt-2 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                      <strong>Warning:</strong> Please confirm the receiver details before sending money out.
                    </div>
                  </div>
                )}
                {receiverFetchError && (
                  <div className="mt-2 text-red-600">{receiverFetchError}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={transferForm.amount}
                  onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={transferForm.description}
                  onChange={e => setTransferForm({ ...transferForm, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowTransferModal(false)} className="px-4 py-2 rounded bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Withdraw</h2>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={withdrawForm.amount}
                  onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={withdrawForm.description}
                  onChange={e => setWithdrawForm({ ...withdrawForm, description: e.target.value })}
                />
              </div>
              <div>
                <button
                  type="button"
                  className="mt-2 text-blue-600 underline text-sm"
                  onClick={() => setShowAddExternal(true)}
                >
                  + Add an external account
                </button>
              </div>
              {showAddExternal && (
                <form onSubmit={handleAddExternalAccount} className="mt-4 bg-gray-50 p-4 rounded border">
                  <h3 className="font-semibold mb-2">Add an External Bank Account</h3>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Routing Number</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={externalForm.routingNumber}
                      onChange={e => setExternalForm({ ...externalForm, routingNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={externalForm.accountNumber}
                      onChange={e => setExternalForm({ ...externalForm, accountNumber: e.target.value })}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add Account
                  </button>
                </form>
              )}
              {externalMessage && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded border border-green-300">
                  {externalMessage}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowWithdrawModal(false)} className="px-4 py-2 rounded bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-yellow-600 text-white">
                  Withdraw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Payment Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Request Payment</h2>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">From Account Number</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={requestForm.fromAccount}
                  onChange={e => setRequestForm({ ...requestForm, fromAccount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={requestForm.amount}
                  onChange={e => setRequestForm({ ...requestForm, amount: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={requestForm.description}
                  onChange={e => setRequestForm({ ...requestForm, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-purple-600 text-white">
                  Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wire Transfer Modal */}
      {showWireTransferModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Wire Transfer</h2>
            <form onSubmit={handleWireTransfer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipient Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={wireForm.recipientName}
                    onChange={e => setWireForm({ ...wireForm, recipientName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipient Bank Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={wireForm.recipientBank}
                    onChange={e => setWireForm({ ...wireForm, recipientBank: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipient Account Number</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={wireForm.recipientAccount}
                    onChange={e => setWireForm({ ...wireForm, recipientAccount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipient Routing Number</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={wireForm.recipientRouting}
                    onChange={e => setWireForm({ ...wireForm, recipientRouting: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank SWIFT Code</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={wireForm.bankSwift}
                    onChange={e => setWireForm({ ...wireForm, bankSwift: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank Address</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={wireForm.bankAddress}
                    onChange={e => setWireForm({ ...wireForm, bankAddress: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipient Address</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={wireForm.recipientAddress}
                    onChange={e => setWireForm({ ...wireForm, recipientAddress: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={wireForm.amount}
                    onChange={e => setWireForm({ ...wireForm, amount: e.target.value })}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={wireForm.description}
                  onChange={e => setWireForm({ ...wireForm, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowWireTransferModal(false)} className="px-4 py-2 rounded bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-teal-600 text-white">
                  Submit Wire Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {wireMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-center">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Wire Transfer Processing</h2>
            <p className="mb-6 text-gray-700">
              Your wire transfer is being processed and confirmed by the bank.<br />
              We’ll send you an email if it has been processed successfully.
            </p>
            <button
              className="px-6 py-2 rounded bg-blue-600 text-white"
              onClick={() => setWireMessage('')}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;