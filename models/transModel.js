const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  transaction_id: {type:String, required:true},
  value: {type:Number, required:true},
  from:{type:String, required:true},
  to:{type:String, required:true},
  ref:{type:String, required:true},
  data:{type:String, required:false, default:""}
});

module.exports = mongoose.model("Transactions", TransactionSchema);

