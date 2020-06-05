const mongoose = require('mongoose');

const CustomerSchema= mongoose.Schema({

  name:String,
  emailid:String,
  password:String,
  mobile:String,
  address:String,
  created_date:{type:Date,default:Date.now}

})
module.exports=mongoose.model('customer',CustomerSchema)
