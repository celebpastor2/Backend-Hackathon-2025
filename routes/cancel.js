const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('shop/cancel', {
    pageTitle: 'Cancelled',
    path: '/cancel'
  });
});

module.exports = router;