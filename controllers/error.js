const paystack = require("paystack-sdk");
const random = require("random-string-generator")
exports.get404 = (req, res, next) => {
  res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "/404",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.get500 = (req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Server Error ❌",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.initiateLoadBalance = async (req, res)=>{
   const pay = paystack("sk_test_21b9deacdef107db3cc1933657dd2a3015e27afa");
   const {amount}   = req.body;
   const user       = req.user || req.session.user;

   if( ! user ){
    res.redirect('/signup');
   } else {
    try {
      const transRef = random(12);
      const resp = await pay.transaction.initialize({
          email: user.email,
          amount: (amount * 100 ),
          reference: transRef,
          currency:"USD",

      });
      /**{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/3ni8kdavz62431k",
    "access_code": "3ni8kdavz62431k",
    "reference": "re4lyvq3s3"
  }
} */
      user.buyReference = transRef;
      user.buyAmount    = amount;
      user.buyTime      = Date.now();
      user.save();

      res.redirect(resp?.data?.authorization_url);

      } catch(e){
        res.redirect('/admin/load-balance');
      }  
      
   }
}


exports.verifyLoadedBalance = async (req,res)=>{
  const {reference} = req.params;
  const user      = req.user || req.session.user;
const pay = paystack("sk_test_21b9deacdef107db3cc1933657dd2a3015e27afa");
  try {
    const resp = await pay.transaction.verify(reference);

    if( user.buyReference == reference && resp && resp.data && resp.data.status == "success" && user.buyReference == resp.data.reference ){
      user.point += parseFloat(resp.data.amount) / 100;
      user.save();
      res.status(200).json({
        success:true,
        message: "Successfully fullfilled transaction with ID: " + resp.data.reference
      });
    } else {
      resp.json({
        error:true,
        message:`Transaction with ID: ${resp.data.reference} is not yet confirmed to be successful`
      });
    }
    
  } catch(e){
    res.status(500).json({error: true, message: e.message});
  }
}
 