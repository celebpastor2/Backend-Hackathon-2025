const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

// GET Profile Page
router.get('/', isAuth, (req, res) => {
  res.render('shop/profile', {
    pageTitle: 'Your Profile',
    path: '/profile',
    isAuthenticated: req.session.isLoggedIn,
    currentUser: req.user,
    csrfToken: req.csrfToken()
  });
});

// POST Update Profile
router.post('/edit', isAuth, async (req, res) => {
  const { name, email } = req.body;

  try {
    req.user.name = name;
    req.user.email = email;
    await req.user.save();
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.redirect('/profile');
  }
});

module.exports = router;
