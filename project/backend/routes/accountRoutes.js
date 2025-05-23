const express = require('express');
const User = require('../models/User');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/accounts', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user);
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({
    accounts: [
      {
        accountNumber: user.accountNumber,
        accountType: 'Checking',
        status: 'Active',
        currency: 'USD',
        routingNumber: user.routingNumber || '101000019',
        balance: user.balance,
      },
    ],
  });
});

router.get('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  // Only accessible by admins
});

// Get account details by account number
router.get('/:accountNumber', async (req, res) => {
  try {
    const user = await User.findOne({ accountNumber: req.params.accountNumber });
    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json({
      fullName: `${user.firstName} ${user.lastName}`,
      address: user.address,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;