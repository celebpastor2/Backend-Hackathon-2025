const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('cancel', { pageTitle: 'Cancelled' });
});

module.exports = router;
