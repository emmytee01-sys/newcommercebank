const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();


router.get('/transactions', authMiddleware, async (req, res) => {
  const user = req.user;
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({
    transactions: user.transactions || []
  });

});

router.get('/accounts', authMiddleware, async (req, res) => {
  const user = req.user;
  if (!user) return res.status(404).json({ message: 'Account not found' });

  const accounts = [{
    accountNumber: user.accountNumber,
    accountType: user.accountType || 'Checking',
    status: user.status || 'Active',
    currency: user.currency || 'USD',
    routingNumber: user.routingNumber || '101000019',
    balance: user.balance,
  }];

  res.json({ accounts });
});

// Credit wallet
router.post('/credit', async (req, res) => {
  const { accountNumber, amount, description } = req.body;
  const user = await User.findOne({ accountNumber });
  if (!user) return res.status(404).json({ message: 'Account not found' });
  user.balance += Number(amount);
  user.transactions.push({ type: 'credit', amount, description });
  await user.save();
  res.json({ balance: user.balance });
});

// Debit wallet
router.post('/debit', async (req, res) => {
  const { accountNumber, amount, description } = req.body;
  const user = await User.findOne({ accountNumber });
  if (!user) return res.status(404).json({ message: 'Account not found' });
  if (user.balance < amount) return res.status(400).json({ message: 'Insufficient funds' });
  user.balance -= Number(amount);
  user.transactions.push({ type: 'debit', amount, description });
  await user.save();
  res.json({ balance: user.balance });
});

// Transfer funds
router.post('/transfer', async (req, res) => {
  const { fromAccount, toAccount, amount, description } = req.body;
  const sender = await User.findOne({ accountNumber: fromAccount });
  const receiver = await User.findOne({ accountNumber: toAccount });

  if (!sender || !receiver) return res.status(404).json({ message: 'Account not found' });
  if (sender.balance < amount) return res.status(400).json({ message: 'Insufficient funds' });

  sender.balance -= amount;
  receiver.balance += amount;

  sender.transactions.push({ type: 'debit', amount, description, to: toAccount, date: new Date() });
  receiver.transactions.push({ type: 'credit', amount, description, from: fromAccount, date: new Date() });

  await sender.save();
  await receiver.save();

  res.json({ message: 'Transfer successful' });
});

// Request payment (record a request, not actual transfer)
router.post('/request', async (req, res) => {
  const { fromAccount, toAccount, amount, description } = req.body;
  const receiver = await User.findOne({ accountNumber: toAccount });
  if (!receiver) return res.status(404).json({ message: 'Account not found' });

  receiver.transactions.push({ type: 'request', amount, description, from: fromAccount });
  await receiver.save();

  res.json({ message: 'Payment request sent' });
});

// Wire transfer
router.post('/wire-transfer', async (req, res) => {
  try {
    // Extract and validate fields from req.body
    // Save wire transfer request to DB or process as needed
    res.json({ message: 'Wire transfer submitted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Wire transfer failed' });
  }
});

// Example route
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('firstName lastName email');
  res.json(user);
});


router.get('/:accountNumber', async (req, res) => {
  const { accountNumber } = req.params;
  const user = await User.findOne({ accountNumber });
  if (!user) return res.status(404).json({ message: 'Account not found' });
  res.json({ balance: user.balance, transactions: user.transactions });
});




module.exports = router;