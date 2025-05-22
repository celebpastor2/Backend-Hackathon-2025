const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('shop/success', {
    pageTitle: 'Success',
    path: '/success'
  });
});

module.exports = router;