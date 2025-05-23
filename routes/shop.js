const express = require("express");
const path = require("path");
const router = express.Router();

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

router.get("/", shopController.getIndex);

// router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/products/specials/:prod", shopController.getSpecial);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);
router.get('/profile', isAuth, (req, res) => {
    res.render('shop/profile', {
        pageTitle: 'Your Profile',
        path: '/profile',
        isAuthenticated: req.session.isLoggedIn,
        currentUser: req.user,
        csrfToken: req.csrfToken()
    });
});


router.get("/orders", isAuth, shopController.getOrders);

// router.post("/create-order", isAuth, shopController.postOrder);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

router.get("/checkout", isAuth, shopController.getCheckout);

router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);

router.get("checkout/cancel", isAuth, shopController.getCheckout);

router.post("bill-user-product", isAuth, shopController.billUserProducts);
router.get("/test-cart", shopController.getTestCart);
// In your routes/shop.js file
// Add to routes/shop.js
router.post('/reduce-cart-quantity', isAuth, shopController.postCartReduceQuantity);
router.get('/cart-count', isAuth, shopController.getCartCount);
// In your routes/shop.js file
router.get('/checkout/success', shopController.getCheckoutSuccess);
router.get('/checkout/failed', shopController.getCheckoutFailed);
router.get('/download-invoice/:reference', shopController.downloadInvoice);

module.exports = router;
