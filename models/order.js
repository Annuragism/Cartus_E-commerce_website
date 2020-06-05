const mongoose = require('mongoose');

const OrderSchema= mongoose.Schema({
  pid:{ type: mongoose.Schema.ObjectId, required: true},
  pname:String,
  Imagename:String,
  quantity:String,
  price:String,
  user:String,
})
module.exports=mongoose.model('order',OrderSchema)
