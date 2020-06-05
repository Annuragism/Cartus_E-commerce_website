const mongoose = require('mongoose');

const CartSchema= mongoose.Schema({
  pid:{ type: mongoose.Schema.ObjectId, required: true},
  quantity:String,
  user:String,

})
module.exports=mongoose.model('cart',CartSchema)
