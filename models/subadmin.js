const mongoose = require('mongoose');

const SubAdminloginSchema= mongoose.Schema({

  name:String,
  emailid:String,
  password:String,
  mobile:String,
  created_date:{type:Date,default:Date.now}

})
module.exports=mongoose.model('subadmin',SubAdminloginSchema)
