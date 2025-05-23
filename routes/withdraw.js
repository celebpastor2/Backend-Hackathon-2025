const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/withdraw', (req, res) => {
  res.render('withdraw', { pageTitle: 'Withdraw' });
});

router.post('/withdraw', async (req, res) => {
  const amount = parseFloat(req.body.amount);

  if (!req.user) {
    req.flash('error', 'You must be logged in.');
    return res.redirect('/auth/login');
  }

  if (isNaN(amount) || amount <= 0) {
    req.flash('error', 'Invalid amount.');
    return res.redirect('/withdraw');
  }

  try {
    const user = await User.findById(req.user._id);

    if (user.point < amount) {
      req.flash('error', 'Insufficient balance.');
      return res.redirect('/cancel');
    }

    user.point -= amount;
    user.withdrawn += amount;
    await user.save();

    return res.redirect('/success');
  } catch (err) {
    console.error(err);
    return res.redirect('/500');
  }
});

module.exports = router;
