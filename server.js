const express = require('express');
const path = require('path');
const fs=require('fs')
const hbs = require('express-handlebars');
const bodyparser = require('body-parser');
const session=require('express-session');
var ip=require("ip")
//----------------------------------------------
const Order=require('./models/order')

//-------------------------------------------------
//Node Mailer
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'akshats540@gmail.com',
    pass: '420540420'
  }
});
//-------------------------------------------------


const app=express()



//configure view engine as hbs
app.set('views',path.join(__dirname,'views'))            //location
app.set('view engine','hbs')      // set path (view engine,'ext-name')
//configure layouts in mainlayout as it imports in all of the pages

app.engine('hbs',hbs({

extname: 'hbs',
defaultLayout:'mainlayout',
layoutDir:__dirname+'/views/layouts/'

}))
//----------------------------------------------------------------
//----------------------------------------------------------------

//server configuration
//server creation and start server  ---listen(port no,function)------
app.listen(4000,()=>{
  console.log("Server started on port :4000");
})
//---------------------------------------------------------------
//start session----------
app.use(session({secret:'asdfdfss'}))
//---------------------------------------------------------------
//----------------------------------------------------------------
//caching disabled for every route
// app.use(function(request,response,next){
//   response.set('cache-Control','no-cache, private,no-store, must-revalidate, max-state=0, post-check=0, pre-check=0');
//   next();
// })
//---------------------------------------------------------------


//configure body parser
app.use(bodyparser.json())//enables to transfer data in Jason format
app.use(bodyparser.urlencoded({
  extended:true      //upto the data length
}))
//----------------------------------------------------
app.use(express.static(path.join(__dirname,'views')))
//-----------------------------------------------------
//create mongoose connection
const mongoose=require('mongoose')
const URL="mongodb://localhost:27017/Cartus";
mongoose.connect(URL)
//----------------------------------------------------------------------
//######################################################################
//
app.get('/',(req,res)=>{
  Product.find((err,result)=>{
    if(err) throw err;
    else
    res.render('index',{products:result,uid:req.session.user})
})
})
//------------------------------------------------------------------------
app.get('/aboutus',(req,res)=>{res.render('aboutus')})
app.get('/services',(req,res)=>{res.render('services')})

//#######################################################################
//                  ADMIN PANEL
//######################################################################
app.get('/admin',(req,res)=>{
  res.render('adminlogin')
})
app.get('/adminhome',(req,res)=>{
  if(req.session.admin==null){res.render('adminlogin')}
  res.render('adminhome',{aid:req.session.admin})
})
//----------------------
// app.get('/insert',(req,res)=>{
//   var newdata=Adminlogin({
//     name:'Anurag Sharma',
//     emailid:'anu.sharma74114@gmail.com',
//     password:'admin123'
//   })
//   newdata.save()
// })
const Adminlogin=require('./models/adminlogin')
app.post('/admin-logincheck',(req,res)=>{
 var email=req.body.email;
 //console.log(email);
 var password=req.body.pwd;
 //console.log(password);
 Adminlogin.find({emailid:email,password:password},(err,result)=>{
   //console.log(result);
   if(err) throw err;
   else if(result.length!=0)
   {
     req.session.admin=email;

     res.render('adminhome',{aid:req.session.admin})
   }
   else

   res.render('adminlogin',{msg:'login Fail,Try again',})
   })
})
//-------------------------------------------------------
//admmin fgt pwd
app.get('/forget-admin-password',(req,res)=>{
  res.render('forget-admin-password')
})


app.post('/getAPwd',(req,res)=>{
  var email=req.body.email;
  console.log(email);
  Adminlogin.find({emailid:email},(err,result)=>{
    if(err) throw err;
    else {
   console.log(result[0].password);
   var mailOptions = {
     from: 'akshats540@gmail.com',
     to: email,
     subject: 'Password Recover for Cartus.com',
     text: 'Hello '+email+" ,you requested for the new password and  your passwword is "+result[0].password+"which is valid for 60 min.Thank you..!!! Team Cart us"
   };
   transporter.sendMail(mailOptions, function(error, info){
     if (error) {
       console.log(error);
     } else {
res.render('forget-admin-password',{msg:'Password is sent on your mail id'})
      // console.log('Email sent: ' + info.response);
     }
   });
}
})
})


//#####################################################################
//admin login ends here
app.get('/admin-logout',(req,res)=>{
req.session.destroy();
res.render('adminlogin',{msg:'Logout successfully'})

})
//###########################################################################
//############----------ADMIN CREATE SUBADMIN---------#########################
app.get('/create-subadmin',(req,res)=>{
  if(req.session.admin==null){res.render('index')}
  res.render('create-subadmin',{aid:req.session.admin})
})
//-------------------
const Subadmin=require('./models/subadmin')
app.post('/create-subadmin',(req,res)=>{
 var name=req.body.name;
 var email=req.body.email;
 var password=req.body.password;
 var mno=req.body.mno;

 var newsubadmin=Subadmin({
  name:name,
  emailid:email,
  password:password,
  mobile:mno
 })

 var mailOptions = {
   from: 'akshats540@gmail.com',
   to: email,
   subject: 'Welcome to Cartus.com',
   text: 'Hello '+email+" ,you are welcome to Cartus family as subadmin and  your passwword is "+password+".Thank you..!!! Team Cart us"
 };
 transporter.sendMail(mailOptions, function(error, info){
   if (error) {
     console.log(error);
   } else {
     newsubadmin.save().then((data)=>console.log("subAdmin created...."+data));
     res.render('adminhome',{msg:'Subadmin created...',aid:req.session.admin})
   }
 });
})
//##########################################################################
//----------------update SubAdmins-----------------------------------
var ObjectID = require('mongodb').ObjectID;

var pid;
app.get('/updatesubadmin',(req,res)=>{
  if(req.session.admin==null){res.render('adminlogin')}
   pid=req.query.pid
  //console.log(pid);
Subadmin.findOne({"_id": new ObjectID(pid)},(err,result)=>{
if(err) throw err;
else {
  console.log(result);
  res.render('update-subadmin',{data:result,aid:req.session.admin})
}
})
})
//----------------

app.post('/upadate-subadmin-action',(req,res)=>{
  //console.log(pid);


  //var id=objectId.toHexString(pid)
  //var id=new mongoose.Types.ObjectId(pid)
  //var myId = JSON.parse(req.body.pid);
  var name=req.body.name;
   var email=req.body.email;
   var password=req.body.password;
   var mobile=req.body.mno
//var o_id = new mongodb.ObjectID(pid);
   Subadmin.findOneAndUpdate({"_id":new ObjectID(pid)},{$set:{name:name,emailid:email,password:password,mobile:mobile}},(err,result)=>{
      if(err) throw err;
      else
{         // console.log("Updated");
          Subadmin.find((err,result)=>{
            if(err) throw err;
            //console.log(result);
            res.render('show-subadmin',{data:result,msg:'Subadmin Details Updated',aid:req.session.admin})
          })
}
     })
 })








//#######################################################################
//----------------Show subadmins-------------------------------
app.get('/show-subadmin',(req,res)=>{
  if(req.session.admin==null){res.render('adminlogin')}
Subadmin.find((err,result)=>{
  if(err) throw err;
  else {
    res.render('show-subadmin',{data:result,aid:req.session.admin}
  )}
})
})
//-------------------------------------------------------------------
//delete subadmin
app.get('/del-subadmin',(req,res)=>{
  if(req.session.admin==null){res.render('adminlogin')}

var mobile=req.query.mno;
Subadmin.remove({mobile:mobile},(err,result)=>{
  if(err) throw err;
  else if(result.affectedRows!=0)
{
  Subadmin.find((err,result)=>{
    if(err) throw err;
    else {
      res.render('show-subadmin',{data:result,aid:req.session.admin}
    )}
  })
}
})
})

//-------------------------------------------------------------------
//##########################################################################
//----------------Customer Account Creation----------------------
app.get('/create-customer',(req,res)=>{
  if(req.session.user==null){res.render('index')}
res.render('customer-signup')
})
//------------------->
const Customer=require('./models/customer')
app.post('/create-customer',(req,res)=>{
 var name=req.body.name;
 var email=req.body.email;
 var password=req.body.password;
 var mno=req.body.mno;
 var address=req.body.address;

 var newcustomer=Customer({
  name:name,
  emailid:email,
  password:password,
  mobile:mno,
  address:address
 })
 newcustomer.save().then((data)=>console.log("customer created...."+data));
 res.render('index',{msg:'Account created...',})
})

//-------------------------------------------------------------------
//#######################################################################
//---------------------(view delete)Customer Page via admin panel-----------------------
app.get('/customer-page',(req,res)=>{
  res.render('customer-page',{uid:req.session.user,aid:req.session.admin})

})

app.get('/show-customer',(req,res)=>{
Customer.find((err,result)=>{
  if(err) throw err;
  else {
    res.render('view-customer',{data:result,uid:req.session.user,aid:req.session.admin,sid:req.session.subadmin}
  )}
})
})
//-------------------------------------------------------------------
//delete customer
app.get('/del-customer',(req,res)=>{
  if(req.session.admin==null){res.render('adminlogin')}
 else if(req.session.subadmin==null){res.render('subadminlogin')}
 else{res.render('index',{aid:req.session.admin,sid:req.session.subadmin})}

var mobile=req.query.mno;
Customer.remove({mobile:mobile},(err,result)=>{
  if(err) throw err;
  else if(result.affectedRows!=0)
{
  Customer.find((err,result)=>{
    if(err) throw err;
    else {
      res.render('view-customer',{data:result,aid:req.session.admin,sid:req.session.subadmin}
    )}
  })
}
})
})
//#########################################################################
//-----------------------Product Page via Admin----------------------

app.get('/product-page',(req,res)=>{
  if(req.session.admin==null){res.render('adminlogin')}
  else if(req.session.subadmin==null){res.render('subadminlogin')}
  else{res.render('productpage',{aid:req.session.admin,sid:req.session.subadmin})}

})
//------------------
//-------------------------------------------------------------------------
//upload files
const upload=require('express-fileupload');
app.use(upload())
//------------------
app.get('/upload-product',(req,res)=>{
  //  if(req.session.admin==null){res.render('adminlogin')}
  // else if(req.session.subadmin==null){res.render('subadminlogin')}
  // else{
  res.render('upload-product',{aid:req.session.admin,sid:req.session.subadmin})
})
var Product=require('./models/Product')
app.post('/fileupload',(req,res)=>{
  console.log(req.files);
  if(req.files)
  {
     var productname=req.body.pname;
     var categoryname=req.body.category;
     var price=req.body.price;
     var quantity=req.body.quantity;

     var description=req.body.description;
     var file=req.files.imagename;
     var imgname=file.name;
     var newimgname=Math.floor(Math.random()*1000000)+imgname;
     file.mv('./upload/'+newimgname,(err,result)=>{
       if(err) throw err;
       else {
           var newdata=Product({
             pname:productname,
             category:categoryname,
             Imagename:newimgname,
             price:price,
             quantity:quantity,
             Description:description
           })
           newdata.save().then((data)=>{
             res.render('upload-product',{msg:'File Uploaded',sid:req.session.subadmin,aid:req.session.admin})
           })
       }
     })
}
})
//------------------------------------------------------------------------
//show Products
app.use(express.static('upload'))//it include images to show
app.get('/show-product',(req,res)=>{

  Product.find((err,result)=>{
    if(err) throw err;
    else if(req.session.admin==null){res.render('adminlogin')}
    else
      res.render('showproduct',{data:result,aid:req.session.admin})
  })
  })
//-------------------------------------------------------------------------
//-------------------------------------------------------------------
//delete product from show products
app.get('/delpro',(req,res)=>{
  if(req.session.admin==null){res.render('index')}
var pname=req.query.pname;
Product.remove({pname:pname},(err,result)=>{
  if(err) throw err;
  else if(result.affectedRows!=0)
{
  Product.find((err,result)=>{
    if(err) throw err;
    else {
      res.render('showproduct',{data:result,aid:req.session.admin}
    )}
  })
}
})
})

//-------------------------------------------------------------------
//#####################################################################
//###########  SUBADMIN PANEL          ##############################
//Sub-admin login
app.get('/subadmin',(req,res)=>{
  res.render('subadminlogin')
})

app.get('/subadminhome',(req,res)=>{
  //.log(req.session.user);
  if(req.session.subadmin==null){res.render('subadminlogin')}
  res.render('subadminhome',{sid:req.session.subadmin})
})
//---------------------------------------------------------------------------
//------subadmin logout
app.get('/subadmin-logout',(req,res)=>{
req.session.destroy();
res.render('subadminlogin',{msg:'Logout successfully'})

})
//--------------------------------------------------------------------------
//view customers via subAdmin
app.get('/show-product-subadmin',(req,res)=>{
  //console.log(req.session.subadmin);
  Product.find((err,result)=>{
  if(err) throw err;
  else if(req.session.subadmin==null){res.render('subadminlogin')}
  else {
    res.render('show-product-subadmin',{data:result,sid:req.session.subadmin}
  )}
})
})

//-------------------------------------------------------------------------
//--------------subadmin login check------------------

const Subadminlogin=require('./models/subadmin')
app.post('/subadmin-logincheck',(req,res)=>{
 var email=req.body.email;
 var password=req.body.password;
 Subadminlogin.find({emailid:email,password:password},(err,result)=>{
   if(err) throw err;
   else if(result.length!=0)
   {
     req.session.subadmin=email;

     res.render('subadminhome',{sid:req.session.subadmin})
   }
   else
   res.render('subadminlogin',{msg:'login Fail,Try again',})
   })
})
//##########################################################################33
//##################     Forget password (Subadmin)          #######################3

app.get('/forget-password',(req,res)=>{
  if(req.session.subadmin==null){res.render('index')}
  res.render('forgetpassword')
})


app.post('/getPwd',(req,res)=>{
  var email=req.body.email;
  //console.log(email);
  Subadminlogin.find({emailid:email},(err,result)=>{
    if(err) throw err;
    else {
   //console.log(result[0].password);
   var mailOptions = {
     from: 'akshats540@gmail.com',
     to: email,
     subject: 'Password Recover for Eemail Server',
     text: 'Hello '+email+" , your passwword is "+result[0].password
   };
   transporter.sendMail(mailOptions, function(error, info){
     if (error) {
       console.log(error);
     } else {
res.render('forgetpassword',{msg:'Password is sent on your mail id'})
      // console.log('Email sent: ' + info.response);
     }
   });
}
})
})

//###################----CUSTOMER UPDATE FROM SUBADMIN---######################


app.get('/update-customer-from-subadmin',(req,res)=>{
  var email=req.query.email;
  Customer.find({emailid:email},(err,result)=>{
    if(err) throw err;
    else if(req.session.subadmin==null){res.render('subadminlogin')}
    else
    {
      //console.log(result);
    res.render('update-customer-from-subadmin',{data:result[0],sid:req.session.subadmin})
  }
    })

})


app.post('/update-customer-from-subadmin-action',(req,res)=>{
  //console.log(pid);


  //var id=objectId.toHexString(pid)
  //var id=new mongoose.Types.ObjectId(pid)
  //var myId = JSON.parse(req.body.pid);

  var name=req.body.name;
   var email=req.body.email;
   var password=req.body.password;
   var mobile=req.body.mno
   var address=req.body.address
//var o_id = new mongodb.ObjectID(pid);
   Customer.findOneAndUpdate({emailid:email},{$set:{name:name,emailid:email,password:password,mobile:mobile,address:address}},(err,result)=>{
      if(err) throw err;
      else
{         // console.log("Updated");
          Customer.find((err,result)=>{
            if(err) throw err;
            //console.log(result);
            res.render('view-customer',{data:result,msg:'Customer Details Updated',sid:req.session.subadmin})
          })
}
     })
 })




//#######################################################################




//######################################################################33

//                 CUSTOMER LOGIN

//#######################################################################
  app.post('/customer-login',(req,res)=>{

   var email=req.body.email;
   var password=req.body.password;
   Customer.find({emailid:email,password:password},(err,result)=>{
     if(err) throw err;
     else if(result.length!=0)
     {
       req.session.user=email;
       Cart.updateMany({user:ip.address()},{$set:{user:req.session.user}},(err)=>
     {
       if (err) throw err;
       else {
         Product.find((err,result)=>{
           if(err) throw err;
           else
           res.render('index',{products:result,uid:req.session.user})
       })
       }
     })

     }
     else
     {
       Product.find((err,result)=>{
         if(err) throw err;
         else
         res.render('index',{products:result,uid:req.session.user,msg:'login Fail,Try again'})
     })
     }

    //  res.redirect('/',{msg:'login Fail,Try again',})

  })
})
  //################################################################
  //           Customer forget Password


  app.get('/forget-c-password',(req,res)=>{

    res.render('forget-c-password')
  })


  app.post('/getCPwd',(req,res)=>{
    var email=req.body.email;
    console.log(email);
    Customer.find({emailid:email},(err,result)=>{
      if(err) throw err;
      else {
     console.log(result[0].password);
     var mailOptions = {
       from: 'akshats540@gmail.com',
       to: email,
       subject: 'Password Recover for Cartus.com',
       text: 'Hello '+email+" ,you requested for the new password and  your passwword is "+result[0].password+" which is valid for 60 min.Thank you..!!! Team Cart us"
     };
     transporter.sendMail(mailOptions, function(error, info){
       if (error) {
         console.log(error);
       } else {
  res.render('forgetpassword',{msg:'Password is sent on your mail id'})
        // console.log('Email sent: ' + info.response);
       }
     });
  }
  })
  })


  //#####################################################################
  app.get('/customer-home',(req,res)=>{
    if(req.session.user==null){res.render('index')}

    res.render('customer-home',{uid:req.session.user})
  })
  //---------------------------------------------------------------------------
  //Customer -Profile
  app.get('/profile',(req,res)=>{
    Customer.find({emailid:req.session.user},(err,result)=>{
      if(err) throw err;
      else if(req.session.user==null){res.render('index')}
      else
      //console.log(result);
      res.render('customer-profile',{data:result,uid:req.session.user})
      })

  })
  //###############################################################
  //        CUSTOMER PROFILE UPDATE

  app.get('/update-customer',(req,res)=>{
    Customer.find({emailid:req.session.user},(err,result)=>{
      if(err) throw err;
      else if(req.session.user==null){res.render('index')}
      else
      {
        //console.log(result);
      res.render('update-customer',{data:result[0],uid:req.session.user})
    }
      })

  })


  app.post('/update-customer-action',(req,res)=>{
    //console.log(pid);

     pid=req.body.pid;
     //console.log(pid);
    var name=req.body.name;
     var email=req.body.email;
     var password=req.body.password;
     var mobile=req.body.mno;
     var address=req.body.address;
  //var o_id = new mongodb.ObjectID(pid);
     Customer.findOneAndUpdate({emailid:email},{$set:{name:name,emailid:email,password:password,mobile:mobile,address:address}},(err,result)=>{
        if(err) throw err;
        else
  {         // console.log("Updated");
            Customer.find((err,result)=>{
              if(err) throw err;
              //console.log(result);
              res.render('customer-home',{data:result,msg:'Profile Details Updated',uid:req.session.user})
            })
  }
       })
   })





  //###############################################################
  //           CUSTOMER LOGOUT
  //---------------------------------------------------------------------------
  app.get('/customer-logout',(req,res)=>{
  req.session.destroy();
  Product.find((err,result)=>{
    if(err) throw err;
    else
    res.render('index',{products:result,msg:'Log out successfully'})
})

  })


  //-------------------------------------------------------------------------
//########################################################################
//-------------------- Jquery function--------------
  app.get('/check-subadmin',(req,res)=>{
    var c_mail=req.query.cemail;
    Subadminlogin.find({name:c_mail},(err,result)=>{
      if(err) throw err;
      else if(result.length!=0)
      {
        console.log("email="+c_mail+" exist");
      res.json({'msg':'email:'+c_mail+" "+'Already E``xist'})
      }
      else
        {
          console.log("email="+c_mail+" not exist");
          res.json({'msg':'Available'})
        }

  })
  })
//---------------------------------------------------------------------------
//-------------------------------------------------------------------------
//-------------------- Jquery function--------------
app.get('/check-customer',(req,res)=>{
  var c_mail=req.query.cemail;
  Customer.find({emailid:c_mail},(err,result)=>{
    if(err) throw err;
    else if(result.length!=0)
    {
    console.log("email="+c_mail+" exist");
    res.json({'msg':c_mail+" "+'Already Exist'})
    }
    else
      {
      console.log("email="+c_mail+" not exist");
        res.json({'msg':'Available'})
      }

})
})
//---------------------------------------------------------------------------
//######################################################################
//--------------Update prducts details via admin panel
var ObjectID = require('mongodb').ObjectID;
app.get('/uppro',(req,res)=>{
  var pid=req.query.pid
  //console.log(pid);
Product.findOne({"_id": new ObjectID(pid)},(err,result)=>{
if(err) throw err;

else {
  //console.log(result);
  res.render('update-product',{data:result})
}
})
})
//-----------------
app.post('/updateproductAction',(req,res)=>{
  var pid=req.body.pid
  //console.log(pid);
  var quantity=req.body.quantity;
   var productname=req.body.pname;
   var price=req.body.price;
   var description=req.body.description
   var category=req.body.category;
   //console.log(category);

  if(req.files)
  {

    Product.find({_id:pid},(err,result)=>{
if (err) throw err;
  else
{
  //console.log("-------------------------");
  //console.log(result[0].Imagename);
  fs.unlink('upload/'+result[0].Imagename,(err)=>{if(err) throw err;});
}
    })




    //console.log("if block executed...");
     var file=req.files.imagename;
     var imgname=file.name;
     console.log(imgname);
     var newimgname=Math.floor(Math.random() * 1000000)+imgname;
     file.mv('./upload/'+newimgname,(err,result)=>{
     if(err) throw err;
     else
    {
    //update code
Product.updateOne({"_id": new ObjectID(pid)},{$set:{pname:productname,Imagename:newimgname,quantity:quantity,Description:description,price:price,category:category}},(err,result)=>{
   if(err) throw err;
   else
  {
  //console.log("Updated");
  Product.find((err,result)=>{
    if(err) throw err;
    res.render('show-product-subadmin',{data:result,msg:'File Details with Image Updated',sid:req.session.subadmin,aid:req.session.admin})
  })
}
  })
   }
   })
 }else{
   //console.log("else block executed...");
   Product.update({"_id": new ObjectID(pid)},{$set:{pname:productname,quantity:quantity,Description:description,price:price,category:category}},(err,result)=>{
      if(err) throw err;
      else
{         // console.log("Updated");
          Product.find((err,result)=>{
            if(err) throw err;
            //console.log(result);
            res.render('show-product-subadmin',{data:result,msg:'File Details Updated',sid:req.session.subadmin,aid:req.session.admin})
          })
}
     })

 }

})
//##############################################################################
// //################    ADD TO CART   #################################
const Cart=require('./models/cart')

app.post('/add-to-cart',(req,res)=>{
  //console.log(req.session.user);
  var pid=req.body.pid
  var quantity=req.body.quantity;
  //console.log(pid+"\n"+quantity);
   userip=ip.address();
   if(req.session.user==null)
   {
   var user=userip;
   }
   else {
     var user=req.session.user;
   }
   //------------------->

    var newcart=Cart({
     pid:pid,
     quantity:quantity,
     user:user
    })
    newcart.save().then((data)=>{
      Product.find((err,result)=>{
        if(err) throw err;
        else if(req.session.user==null){
           userip=ip.address();
           res.render('index',{products:result,userip:userip,msg:'Product included in cart......!!!'})
         }

        else
        res.render('index',{products:result,uid:req.session.user,msg:'Product included in cart...'})
    })
    })
})
//-------------------------------------------------------------------------------------------------------
//#######################################################################################
//##################    CART   ###############################3
app.get('/cart',(req,res)=>{
  //console.log(req.session.user);
  var user=req.session.user
  if(req.session.user==null){
   userip=ip.address();
   //joining the cart and mongo table
   Cart.aggregate(
     [{
          $lookup:
                   {
                       from:"products",
                       localField:"pid",
                       foreignField:"_id",
                       as:"pro"
                   }
     },{$match:{user:userip}}
   ],(err,result)=>{
       if (err) throw err;
       //console.log(result);
       var fprice=result.map((rec)=>{
       return rec.pro[0].price*rec.quantity;
       })
       console.log(">>>>>"+fprice);

       var finaldata=result.map((rec,index)=>{
         var pair={fprice:fprice[index]};
         var objs={...rec,...pair}
         return objs;
       })

       var grandTotal=fprice.reduce((total,num)=>{return total+num},0)
       //console.log("Grand Total="+grandTotal);
       //--------------------------------
       res.render('cart',{cart:finaldata,userip:userip,gTotal:grandTotal})
     }
   )
   }
  else
  {
      Cart.aggregate(
        [{
             $lookup:
                      {
                          from:"products",
                          localField:"pid",
                          foreignField:"_id",
                          as:"pro"
                      }
        },{$match:{user:user}}
      ],(err,result)=>{
          if (err) throw err;
          else
          //console.log(result);
          //---------------------------------
          var fprice=result.map((rec)=>{
          return rec.pro[0].price*rec.quantity;
          })
          //console.log(">>>>>"+fprice);

          var finaldata=result.map((rec,index)=>{
            var pair={fprice:fprice[index]};
            var objs={...rec,...pair}
            return objs;
          })

          var grandTotal=fprice.reduce((total,num)=>{return total+num},0)
          //console.log("Grand Total="+grandTotal);
          //--------------------------------
          res.render('cart',{cart:finaldata,uid:req.session.user,gTotal:grandTotal})
        }
      )
}

})
//##################    DELETE FROM CART   ###############################3
app.get('/delcart',(req,res)=>{
  pid=req.query.pid
   user=req.session.user;
  if(req.session.user==null){
     userip=ip.address();

     Cart.remove({pid:pid},(err,result)=>{
       if(err) throw err;
       else if(result.affectedRows!=0)
     {
       Cart.aggregate(
         [{
              $lookup:
                       {
                           from:"products",
                           localField:"pid",
                           foreignField:"_id",
                           as:"pro"
                       }
         },{$match:{user:user}}
       ],(err,result)=>{
           if (err) throw err;
           //console.log(result);
           //---------------------------------
           var fprice=result.map((rec)=>{
           return rec.pro[0].price*rec.quantity;
           })
           //console.log(">>>>>"+fprice);

           var finaldata=result.map((rec,index)=>{
             var pair={fprice:fprice[index]};
             var objs={...rec,...pair}
             return objs;
           })

           var grandTotal=fprice.reduce((total,num)=>{return total+num},0)
           //console.log("Grand Total="+grandTotal);
           //--------------------------------
           res.render('cart',{cart:finaldata,userip:userip,gTotal:grandTotal})
         }
       )
     }
     })

}
  else{
    Cart.remove({pid:pid},(err,result)=>{
      if(err) throw err;
      else if(result.affectedRows!=0)
    {
      Cart.aggregate(
        [{
             $lookup:
                      {
                          from:"products",
                          localField:"pid",
                          foreignField:"_id",
                          as:"pro"
                      }
        },{$match:{user:user}}
      ],(err,result)=>{
          if (err) throw err;
          //console.log(result);
          //---------------------------------
          var fprice=result.map((rec)=>{
          return rec.pro[0].price*rec.quantity;
          })
          //console.log(">>>>>"+fprice);

          var finaldata=result.map((rec,index)=>{
            var pair={fprice:fprice[index]};
            var objs={...rec,...pair}
            return objs;
          })

          var grandTotal=fprice.reduce((total,num)=>{return total+num},0)
          //console.log("Grand Total="+grandTotal);
          //--------------------------------
          res.render('cart',{cart:finaldata,uid:req.session.user,gTotal:grandTotal})
        }
      )
    }
    })

  }

})
//----------------------------------------------------------------------------------
//###################       PRODUCT PAGE  (display product)  #########################################

app.get('/product-display',(req,res)=>{
  var pid=req.query.pid;

  Product.find({_id:pid},(err,result)=>{
    if (err) throw err;
    else
      res.render('product-display',{data:result[0],uid:req.session.user})
      })
})
//#####################################################################################
//------------------------------Checkout division--------------------------------------
app.post('/checkout',(req,res)=>{
  var user=req.session.user;
   var pcode=req.body.pcode;
  //console.log("---->"+pcode);
  Cart.aggregate(
    [{
         $lookup:
                  {
                      from:"products",
                      localField:"pid",
                      foreignField:"_id",
                      as:"pro"
                  }
    },{$match:{user:user}}
  ],(err,result)=>{
      if (err) throw err;
      else if (req.session.user==null) { res.render('index',{msg:"Please Login first"})}
      else{
      //---------------------------------
      var fprice=result.map((rec)=>{
      return rec.pro[0].price*rec.quantity;
      })
      //console.log(">>>>>"+fprice);

      var finaldata=result.map((rec,index)=>{
        var pair={fprice:fprice[index]};
        var objs={...rec,...pair}
        return objs;
      })
      console.log(finaldata);
      console.log("---------------------------");

      var grandTotal=fprice.reduce((total,num)=>{return total+num},0)
      grandTotalnew=grandTotal-pcode;
      //console.log(grandTotal);
      //console.log("Grand Total="+grandTotal);
      //----------------------------------
      //sending customers data to page for billing deatils address and all
      Customer.find({emailid:user},(err,result)=>{
        //console.log(result);
        if (err) throw err;
        else
          res.render('checkout',{cart:finaldata,cust_data:result,uid:req.session.user,gTotalnew:grandTotalnew,gTotalold:grandTotal,pcode:pcode})
      })
      //------------------------------------
      // res.render('checkout',{cart:finaldata,uid:req.session.user,gTotal:grandTotal})
    }}
  )//cart aggregete end here
})






//#######################################################################################
//------------------------ Delete all Cart Details   (Empty my cart)----------------------
app.get("/empty-my-cart",(req,res)=>{
  var user=req.session.user;
  Cart.findOne({user:user},(err,result)=>{

    if (err) throw err;
    else if(result==null){res.render('cart',{msg:"your cart is empty already ! Thier is nothing to delete."})}
    else{

       Cart.remove({user:user},(err,result)=>{
         if (err) throw err;
         else{
         Cart.find({user:user},(err,result)=>{
           if (err) throw err;
           else
             res.render('cart',{data:result[0],uid:req.session.user})
           })
          }
         })
    }
    })



})
//#######################################################################################
//my Order
app.get("/my-order",(req,res)=>{
  Order.find({user:req.session.user},(err,result)=>{
    res.render('my-order',{uid:req.session.user,order:result})
  })//order find end here

})//req,res end here
//###########################################################################################
//Payment Gateway
var stripe=require('stripe')('sk_test_9G9gZJLTxWo9aqqqugVzeKfm00iAFd4uTF')//put your secret key here

app.post('/pay',(request,response)=>{

//##################################################################################################
//PAYMENT
//##################################################################################################
var token=request.body.stripeToken;
var chargeamt=request.body.amount;
var charge=stripe.charges.create({
amount:chargeamt,
currency:"inr",
source:token
},(err,result)=>{
if(err /*& r.type==='StripeCardError'*/){
        console.log("Card Decliend");
    }

//Cart table  all product  select

var user=request.session.user;
Cart.aggregate(
  [{
       $lookup:
                {
                    from:"products",
                    localField:"pid",
                    foreignField:"_id",
                    as:"pro"
                }
  },{$match:{user:user}}
],(err,result)=>{
    if (err) throw err;
    else{
    console.log(result);
    //--------------------------
   result.forEach((cart)=>{
   cart.pro.forEach((pro)=>{
     //Insert into OrderTable

     var newOrder=Order({
       pid:cart.pid,
       pname:pro.pname,
       Imagename:pro.Imagename,
       quantity:cart.quantity,
       price:pro.price,
       user:cart.user,
     })
     newOrder.save().then((data)=>console.log("Order created"+data))
   })
   })
    //-------------------------
  }
})
//EMPTY CART
//Delete all products from Cart

Cart.remove({user:user},(err,result)=>{
  var email=request.session.user;
  if (err) throw err;
else{
 //console.log(result);

 // Mailing the order Details
 var mailOptions = {
   from: 'akshats540@gmail.com',
   to: email,
   subject: 'Order details from Cartus',
   text: 'Hello '+email+" ,your order is placed successfully on cartus please login to your Account and see the details.I will be delivered in & business days.Thank you..!!! Team Cart us"
 };
 transporter.sendMail(mailOptions, function(error, info){
   if (error) {
     console.log(error);
   } else {
 //res.render('forget-admin-password',{msg:'Password is sent on your mail id'})
    // console.log('Email sent: ' + info.response);
   }
 });



}
})



response.redirect('/done');
});
});

app.get('/done',(request,response)=>{
  Product.find((err,result)=>{
    if(err) throw err;
    else
    response.render('index',{msg:"Payment Successfull and Order Placed",uid:request.session.user,products:result});
})
});
