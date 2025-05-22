const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('shop/withdraw', {
    pageTitle: 'Withdraw',
    path: '/withdraw'
  });
});

module.exports = router;