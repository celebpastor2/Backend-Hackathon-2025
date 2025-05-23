const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// In your models/order.js file
const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  user: {
    email: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  paymentReference: {
    type: String,
    required: false
  },
  totalAmount: {
    type: Number,
    required: false
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

module.exports = mongoose.model("Order", orderSchema);
