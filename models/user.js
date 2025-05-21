const mongoose = require("mongoose");
const TransModel = require("./transModel");
const random = require("random-string-generator");
// const { update } = require("./product");
const Schema = mongoose.Schema;

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
  transactions: [{type:mongoose.Schema.Types.ObjectId, ref: "Transactions"}],//reference 
  trans_nonce: {type:Array, required:false, default:[]},
  withdrawn: {type:Number, default:0.00},
  buyReference: {type:String, default:""},
  buyAmount: {type:Number, default:0.00},
  buyTime: {type:Number, default:0},
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
      return this.transactions.slice(start, per_page ).map((TransID)=>{
        return TransModel.findOne({_id: TransID});
      });
    }

    return this.transactions.map((TransID)=> {
      return TransModel.findOne({_id: TransID});
    });
      
  }

  userSchema.methods.sendMoney = function(to, amount, ref="normal_transaction"){
      amount = parseFloat(amount);
      if( this.point < amount ){
        return false;
      }

      if( ! to?.point ){
        return false;
      }

      const trans = new TransModel();
      trans.transaction_id = random(12);
      trans.value = amount;
      trans.from = this._id;
      trans.to = to._id;
      trans.ref = ref;

      trans.save();

      this.point -= amount;
      this.transactions.push(trans._id);
      this.save();

      to.point  += amount;
      to.transactions.push(trans._id);
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
