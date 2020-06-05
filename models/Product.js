const mongoose = require('mongoose');

const ProductSchema= mongoose.Schema({

  pname:String,
  category:String,
  Imagename:String,
  price:String,
  quantity:String,
  Description:String,
  uploaded_date:{type:Date,default:Date.now}
})
module.exports=mongoose.model('product',ProductSchema)
