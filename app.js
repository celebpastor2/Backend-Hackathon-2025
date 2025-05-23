require('dotenv').config();
const { MONGO_ATLAS, MONGO_LOCAL, NODE_ENV } = process.env;
const MONGO = NODE_ENV === 'development' ? MONGO_LOCAL : MONGO_ATLAS;
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const app = express();

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const { expressCspHeader } = require('express-csp-header');
// app.js
const fs = require('fs');
const profileRoutes = require('./routes/profile');






// Create directories if they don't exist
const invoicesDir = path.join(__dirname, 'data', 'invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const successRoutes = require('./routes/success');
const cancelRoutes = require('./routes/cancel');
const withdrawRoutes = require('./routes/withdraw');

const errorController = require('./controllers/error');
const User = require('./models/user');

// Session store
const store = new MongoDBStore({
  uri: MONGO,
  collection: 'sessions',
});

const csrfProtection = csrf();
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/webp'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

// Security
app.use(helmet());
app.use(compression());
app.use(
  expressCspHeader({
    directives: {
      'img-src': ["'self'", 'https://res.cloudinary.com'],
    },
  })
);

// Parsing and static
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer({ storage, fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Session
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store,
  })
);



app.use(csrfProtection);
app.use(flash());

// Current User Middleware
app.use((req, res, next) => {
  if (!req.session.user) return next();

  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) return next();
      req.user = user;
      next();
    })
    .catch((err) => {
      console.error(err);
      next(new Error(err));
    });
});

// CSRF Token and Auth state
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.user ?? req.session.user;
  next();
});

// Routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(successRoutes);
app.use(cancelRoutes);
app.use(withdrawRoutes);
app.use('/profile', profileRoutes);


// Payment Balance
app.post('/initiate-load-balance', errorController.initiateLoadBalance);
app.get('/verify-balance/:reference', errorController.verifyLoadedBalance);

// Error Routes
app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.error(error);
  res.redirect('/500');
});

// Server Init
const PORT = process.env.PORT || 4000;
console.log('Mongo URL:', MONGO);

mongoose
  .connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT);
    console.log(`Server running on port ${PORT}`);
    console.log(`Connected to ${NODE_ENV} Database`);
  })
  .catch(console.error);

  

