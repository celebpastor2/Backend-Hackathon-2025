const mongoose = require("mongoose");
const random = require("random-string-generator");
// const { update } = require("./product");
const Schema = mongoose.Schema;
const TransactionSchema = new Schema({
  transaction_id: {type:String, required:true},
  value: {type:Number, required:true},
  from:{type:String, required:true},
  to:{type:String, required:true},
  ref:{type:String, required:true},
  data:{type:String, required:false, default:""}
});
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique:true
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  isAdmin: {type:Boolean, default:false},
  point:{type:Number, default:0.00},
  currency:{type:String, default:"USD"},
  currencySymbol: {type:String, default:"$"},
  transactions: [TransactionSchema],
  trans_nonce: {type:Array, required:false, default:[]}
});

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {//tis shows the product exist already
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }

  userSchema.methods.getCurrentBalance = function(){
    return this.point.toFixed(2);
  }

  userSchema.methods.getFormattedBalance = function(){
    return this.currencySymbol + " " + this.point.toFixed(2) + " " + this.currency;
  }

  userSchema.methods.getTransactions = function(pignate = true, page = 1, per_page = 12){

    if( pignate && page ){
      let start = (page - 1 ) * per_page;
      return this.transactions.slice(start, per_page );
    }

    return this.transactions;
      
  }

  userSchema.methods.sendMoney = function(to, amount, ref="normal_transaction"){
      amount = parseFloat(amount);
      if( this.point < amount ){
        return false;
      }

      if( ! to?.point ){
        return false;
      }

      const transaction = {
          transaction_id: random(12),
          value: amount,
          from: this._id,
          to: to._id,
          ref: ref,
      };

      this.point -= amount;
      this.transactions.push(transaction);
      this.save();

      to.point  += amount;
      to.transactions.push(transaction);
      to.save();

      return true;
      
  }

  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
