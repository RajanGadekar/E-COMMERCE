var express=require('express');
var app=express();
var upload=require('express-fileupload');
var session=require('express-session');
var bodyparser=require('body-parser');
// var url=require('url');
// var mysql=require('./../connection.js')
// const fileUpload = require('express-fileupload');

app.use(bodyparser.urlencoded({extended:'true'}));
app.use(upload());
app.use(session({
    secret: 'RAJAN',
    resave: true,
    saveUninitialized: true
}));
var adminpanel=require('./routes/admin/adminpanel');
app.use("/admin",adminpanel)
var userpanel=require('./routes/user/userpanel');
app.use("/",userpanel)

app.use(express.static(__dirname+'/public'));
// app.get('/',(req,res)=>{
//     res.render("admin/home.ejs");
// });
app.listen(1000);