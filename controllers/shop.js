// At the top of your shop.js file, add:
const nodemailer = require('nodemailer');

// Then create the transporter (with the correct method name)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to generate invoice HTML
function generateInvoiceHTML(order, user, reference) {
  const currentDate = new Date().toLocaleDateString('en-NG');
  const currentTime = new Date().toLocaleTimeString('en-NG');
  
  let productsHTML = '';
  let totalAmount = 0;
  
  order.products.forEach(item => {
    const itemTotal = item.quantity * item.product.price;
    totalAmount += itemTotal;
    
    productsHTML += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.product.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">₦${item.product.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₦${itemTotal.toFixed(2)}</td>
      </tr>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Invoice - ${reference}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
            .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #094AAC; padding-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #094AAC; margin-bottom: 5px; }
            .invoice-title { font-size: 24px; color: #666; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-info, .customer-info { width: 48%; }
            .info-title { font-size: 16px; font-weight: bold; color: #094AAC; margin-bottom: 10px; }
            .info-content { line-height: 1.6; }
            .products-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .products-table th { background-color: #094AAC; color: white; padding: 12px; text-align: left; }
            .products-table td { padding: 10px; border-bottom: 1px solid #ddd; }
            .total-section { text-align: right; margin-top: 20px; }
            .total-row { margin: 5px 0; }
            .grand-total { font-size: 18px; font-weight: bold; color: #094AAC; border-top: 2px solid #094AAC; padding-top: 10px; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="invoice-header">
            <div class="company-name">SHOPMIP</div>
            <div class="invoice-title">INVOICE</div>
        </div>

        <div class="invoice-details">
            <div class="invoice-info">
                <div class="info-title">Invoice Details</div>
                <div class="info-content">
                    <strong>Invoice Number:</strong> ${reference}<br>
                    <strong>Date:</strong> ${currentDate}<br>
                    <strong>Time:</strong> ${currentTime}<br>
                    <strong>Payment Method:</strong> Paystack
                </div>
            </div>
            <div class="customer-info">
                <div class="info-title">Customer Information</div>
                <div class="info-content">
                    <strong>Name:</strong> ${user.name || 'N/A'}<br>
                    <strong>Email:</strong> ${user.email}<br>
                    <strong>Customer ID:</strong> ${user._id}
                </div>
            </div>
        </div>

        <table class="products-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Unit Price</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${productsHTML}
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">Subtotal: ₦${totalAmount.toFixed(2)}</div>
            <div class="total-row">Shipping: Free</div>
            <div class="total-row grand-total">Grand Total: ₦${totalAmount.toFixed(2)}</div>
        </div>

        <div class="footer">
            <p>Thank you for shopping with Shopmip!</p>
            <p>For any inquiries, please contact us at support@shopmip.com</p>
        </div>
    </body>
    </html>
  `;
}

// Function to generate PDF invoice
async function generateInvoicePDF(invoiceHTML, reference) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(invoiceHTML);
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px'
    }
  });
  
  await browser.close();
  return pdfBuffer;
}

// Function to send invoice email
async function sendInvoiceEmail(userEmail, userName, reference, pdfBuffer) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Invoice for your Shopmip order - ${reference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #094AAC; color: white; padding: 20px; text-align: center;">
          <h1>SHOPMIP</h1>
          <h2>Order Confirmation</h2>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${userName || 'Valued Customer'},</p>
          
          <p>Thank you for your purchase! Your order has been successfully processed.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #094AAC;">Order Details:</h3>
            <p><strong>Order Reference:</strong> ${reference}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-NG')}</p>
            <p><strong>Payment Status:</strong> Completed</p>
          </div>
          
          <p>Please find your invoice attached to this email.</p>
          
          <p>If you have any questions about your order, please don't hesitate to contact our customer support.</p>
          
          <p>Thank you for choosing Shopmip!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This is an automated email. Please do not reply to this email.</p>
            <p>© 2024 Shopmip. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `invoice-${reference}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  return emailTransporter.sendMail(mailOptions);
}

// Update your verifyPayment function to include invoice generation
exports.verifyPayment = (req, res, next) => {
  const reference = req.query.reference;
  
  if (!reference) {
    console.log('No reference provided');
    return res.redirect('/checkout/failed');
  }
  
  console.log('Verifying payment with reference:', reference);
  
  // Verify the payment with Paystack
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  };
  
  const paystackReq = https.request(options, paystackRes => {
    let data = '';
    
    paystackRes.on('data', (chunk) => {
      data += chunk;
    });
    
    paystackRes.on('end', async () => {
      try {
        const response = JSON.parse(data);
        console.log('Paystack response status:', response.status);
        
        if (response.status && response.data && response.data.status === 'success') {
          console.log('Payment verified successfully');
          
          // Payment was successful, create order
          const user = await req.user.populate("cart.items.productId");
          const products = user.cart.items.map(i => {
            return { quantity: i.quantity, product: { ...i.productId._doc } };
          });
          
          const order = new Order({
            user: {
              email: req.user.email,
              userId: req.user
            },
            products: products,
            paymentReference: reference,
            totalAmount: response.data.amount / 100 // Convert from kobo to naira
          });
          
          const savedOrder = await order.save();
          console.log('Order created successfully');
          
          // Generate and send invoice
          try {
            const invoiceHTML = generateInvoiceHTML(savedOrder, req.user, reference);
            const pdfBuffer = await generateInvoicePDF(invoiceHTML, reference);
            
            // Send email with invoice
            await sendInvoiceEmail(req.user.email, req.user.name, reference, pdfBuffer);
            console.log('Invoice email sent successfully');
            
            // Save PDF to server (optional)
            const invoicesDir = path.join(__dirname, '..', 'data', 'invoices');
            if (!fs.existsSync(invoicesDir)) {
              fs.mkdirSync(invoicesDir, { recursive: true });
            }
            
            const pdfPath = path.join(invoicesDir, `invoice-${reference}.pdf`);
            fs.writeFileSync(pdfPath, pdfBuffer);
            
          } catch (emailError) {
            console.error('Error sending invoice email:', emailError);
            // Continue even if email fails
          }
          
          await req.user.clearCart();
          res.redirect('/orders?success=true&reference=' + reference);
          
        } else {
          console.log('Payment verification failed:', response);
          res.redirect('/checkout/failed');
        }
      } catch (error) {
        console.error('Error parsing Paystack response:', error);
        res.redirect('/checkout/failed');
      }
    });
  });
  
  paystackReq.on('error', error => {
    console.error('Paystack request error:', error);
    res.redirect('/checkout/failed');
  });
  
  paystackReq.end();
};

// Add route to download invoice
exports.downloadInvoice = (req, res, next) => {
  const reference = req.params.reference;
  
  // Find the order by payment reference
  Order.findOne({ 
    paymentReference: reference,
    'user.userId': req.user._id 
  })
  .then(async (order) => {
    if (!order) {
      return res.status(404).send('Invoice not found');
    }
    
    try {
      const invoiceHTML = generateInvoiceHTML(order, req.user, reference);
      const pdfBuffer = await generateInvoicePDF(invoiceHTML, reference);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${reference}.pdf"`);
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      res.status(500).send('Error generating invoice');
    }
  })
  .catch(err => {
    console.error('Error finding order:', err);
    res.status(500).send('Error finding order');
  });
};

const Product = require("../models/product");
const Order = require("../models/order");
const PDFDocument = require("pdfkit");
const { STRIPE_KEY } = process.env;
const { cloudinary } = require("../util/cloudinary");
const random = require("random-string-generator");
const User = require("../models/user");
const https = require('https');

const stripe = require("stripe")(STRIPE_KEY);

const fs = require("fs");
const path = require("path");

const ITEMS_PER_PAGE = 12;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      console.error(error);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getSpecial = (req, res, next) => {
  const specialProduct = req.params.prod;
  if (specialProduct !== "ps5") {
    return res.redirect("/");
  }

  Product.find({ title: "PlayStation 5" }).then((product) => {
    res.redirect(`/products/${product[0]._id}`);
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shopmip | Your Favourite Shopping Destination",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        cloudinary: cloudinary,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user.cart.items);
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Update your postCart method in shop.js controller
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      // Return JSON response instead of redirecting
      res.status(200).json({ success: true, message: 'Product added to cart' });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ success: false, message: 'Failed to add product to cart' });
    });
};

exports.verifyPayment = (req, res, next) => {
  const reference = req.query.reference;
  
  if (!reference) {
    console.log('No reference provided');
    return res.redirect('/checkout/failed');
  }
  
  console.log('Verifying payment with reference:', reference);
  
  // Verify the payment with Paystack
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  };
  
  console.log('Paystack API request options:', {
    path: options.path,
    method: options.method,
    authHeader: options.headers.Authorization ? 'Set (starts with: ' + options.headers.Authorization.substring(0, 15) + '...)' : 'Not set'
  });
  
  const paystackReq = https.request(options, paystackRes => {
    let data = '';
    
    paystackRes.on('data', (chunk) => {
      data += chunk;
    });
    
    paystackRes.on('end', () => {
      try {
        console.log('Raw Paystack response:', data);
        const response = JSON.parse(data);
        console.log('Paystack response status:', response.status);
        
        if (response.status && response.data && response.data.status === 'success') {
          console.log('Payment verified successfully');
          
          // Payment was successful, create order
          req.user
            .populate("cart.items.productId")
            .then(user => {
              const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
              });
              
              const order = new Order({
                user: {
                  email: req.user.email,
                  userId: req.user
                },
                products: products,
                paymentReference: reference,
                totalAmount: response.data.amount / 100 // Convert from kobo to naira
              });
              
              return order.save();
            })
            .then(result => {
              console.log('Order created successfully');
              return req.user.clearCart();
            })
            .then(() => {
              res.redirect('/orders?success=true');
            })
            .catch(err => {
              console.error('Error creating order:', err);
              res.redirect('/checkout/failed');
            });
        } else {
          // Payment failed
          console.log('Payment verification failed:', response);
          res.redirect('/checkout/failed');
        }
      } catch (error) {
        console.error('Error parsing Paystack response:', error);
        res.redirect('/checkout/failed');
      }
    });
  });
  
  paystackReq.on('error', error => {
    console.error('Paystack request error:', error);
    res.redirect('/checkout/failed');
  });
  
  paystackReq.end();
};

exports.getCheckoutSuccess = (req, res, next) => {
  const reference = req.query.reference;
  
  if (reference) {
    // If there's a reference, verify the payment
    return this.verifyPayment(req, res, next);
  }
  
  // If no reference, create order directly (for testing only)
  console.log('No reference provided, creating order directly');
  req.user
    .populate("cart.items.productId")
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutFailed = (req, res, next) => {
  res.render('shop/checkout-failed', {
    path: '/checkout/failed',
    pageTitle: 'Payment Failed'
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  // Debug environment variables
  console.log('=== PAYSTACK DEBUG INFO ===');
  console.log('Public Key:', process.env.PAYSTACK_PUBLIC_KEY ? 'Set ✓' : 'Not set ✗');
  console.log('Secret Key:', process.env.PAYSTACK_SECRET_KEY ? 'Set ✓' : 'Not set ✗');
  console.log('Public Key starts with:', process.env.PAYSTACK_PUBLIC_KEY ? process.env.PAYSTACK_PUBLIC_KEY.substring(0, 10) + '...' : 'N/A');
  console.log('Secret Key starts with:', process.env.PAYSTACK_SECRET_KEY ? process.env.PAYSTACK_SECRET_KEY.substring(0, 10) + '...' : 'N/A');
  console.log('=========================');

  let products;
  let total = 0;
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      total = 0;
      const sellersProfile = {};
      
      products.forEach(p => {
        if (p.productId) {
          const price = parseFloat(p.quantity * p.productId.price);
          total += price;
        }
      });

      // Make sure user.point exists, if not set it to 0
      if (!user.point) {
        user.point = 0;
      }

      return {
        payment_method_types: ["card"],
        success_url: req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
        id: "session-" + Date.now(),
        profiles: JSON.stringify(sellersProfile),
        user: JSON.stringify(user)
      };
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        sessionId: session.id,
        profiles: session.profiles,
        currentUser: req.user,
        user: session.user,
        success_url: session.success_url,
        cancel_url: session.cancel_url
      });
    })
    .catch((err) => {
      const error = new Error(err);
      console.log(error);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.billUserProducts = (req, res, next) =>{
  const {seller_id, amount, nonce, buyer_id } = req.body;
  const seller  = User.findById(seller_id);
  const buyer  = User.findById(buyer_id);
  if( buyer.trans_nonce.includes(nonce)){
     const isSend = buyer.sendMoney(seller, amount, "product_purchase");

    if( isSend ){
      buyer.trans_nonce.slice(buyer.trans_nonce.indexOf(nonce), 1 );
      buyer.save();
      return res.send({
        success:true,
        message:"Successfully executed transaction"
      });
    } else {
      return res.send({
        error:true,
        message:"Error Billing Buyer"
      });
    }
  } else {
    return res.send({
      error: true,
      message: "Insecure Transaction Detected"
    });
  }
 
}

// Add this route handler to your shop.js controller
// Add to controllers/shop.js

// controllers/shop.js
exports.postCartReduceQuantity = (req, res, next) => {
  const prodId = req.body.productId;
  
  try {
    // Check if user is logged in
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Find the product in the user's cart
    if (!req.user.cart || !req.user.cart.items) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Find the product in the cart
    const cartProductIndex = req.user.cart.items.findIndex(
      item => item.productId.toString() === prodId.toString()
    );
    
    if (cartProductIndex < 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }
    
    // Get current quantity
    const currentQuantity = req.user.cart.items[cartProductIndex].quantity;
    
    // If quantity is 1, remove the item
    if (currentQuantity <= 1) {
      req.user.cart.items = req.user.cart.items.filter(
        item => item.productId.toString() !== prodId.toString()
      );
    } else {
      // Otherwise, reduce the quantity by 1
      req.user.cart.items[cartProductIndex].quantity = currentQuantity - 1;
    }
    
    // Save the updated cart
    return req.user.save()
      .then(() => {
        res.status(200).json({
          success: true,
          message: 'Quantity updated successfully',
          newQuantity: currentQuantity > 1 ? currentQuantity - 1 : 0
        });
      });
  } catch (err) {
    console.error('Error in postCartReduceQuantity:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update quantity'
    });
  }
};
// controllers/shop.js
exports.getCartCount = (req, res, next) => {
  try {
    // Check if user is logged in
    if (!req.user) {
      return res.status(200).json({ count: 0 });
    }
    
    // Find the user's cart items directly
    // This assumes your User model has cart items directly embedded or referenced
    if (req.user.cart && req.user.cart.items) {
      // Calculate total quantity from cart items
      const count = req.user.cart.items.reduce((total, item) => {
        return total + (item.quantity || 0);
      }, 0);
      
      return res.status(200).json({ count: count });
    } else {
      // If no cart or items, return 0
      return res.status(200).json({ count: 0 });
    }
  } catch (err) {
    console.error('Error in getCartCount:', err);
    return res.status(500).json({ count: 0 });
  }
};

exports.getTestCart = (req, res, next) => {
  res.render("test-cart", {
    pageTitle: "Test Cart Functionality",
    path: "/test-cart",
    csrfToken: req.csrfToken()
  });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => res.redirect("/orders"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


// controllers/shop.js
exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);
      
      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
      
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      
      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc.fontSize(14).text(
          prod.product.title + ' - ' + prod.quantity + ' x ' + '₦' + prod.product.price.toFixed(2)
        );
      });
      
      pdfDoc.text('---');
      pdfDoc.fontSize(20).text('Total Price: ₦' + totalPrice.toFixed(2));
      
      pdfDoc.end();
    })
    .catch(err => next(err));
};