var express = require('express');
var router = express.Router();
var url = require('url')
var query = require("./../../queries");
var con = require("./../../connection");
const session = require('express-session');

var checkLogin = ((session)=>{
    if(session.user_id){
        return true;
    }else{
        return false;
    }
})
var validateLogin = ((session,res)=>{
    if(session.user_id){
        return true;
    }else{
        res.send(`
        <script>
            alert("Need to Login");
            window.location.assign("/login");
        </script>`)
    }
})
router.get("/", (req, res) => {
    var sql = query.select('category');
    con.query(sql, (err, result) => {
        var sql = query.select("subcategory");
        con.query(sql, (err, result1) => {
            var sql = query.select("slider");
            con.query(sql, (err, result2) => {
                var sql = "SELECT * FROM category,subcategory,product WHERE category.category_id=subcategory.cat_id AND subcategory.subcategory_id=product.sub_cat_id";
                con.query(sql, (err, result3) => {
                    data = { 'navlist': result, 'subcategory': result1, 'slider_images': result2, 'products': result3,'islogin':checkLogin(req.session) };
                    res.render("user/home.ejs", data);
                })
            })
        })
    })
})

router.get("/view_product",(req,res)=>{
    urlData = url.parse(req.url,true).query;
    var sql = query.select('category');
    con.query(sql, (err, result) => {
        var sql = query.select("subcategory");
        con.query(sql, (err, result1) => {
            var sql = "SELECT * FROM category,subcategory,product WHERE category.category_id=subcategory.cat_id AND subcategory.subcategory_id=product.sub_cat_id AND product.product_id='"+urlData.product_id+"'";
            con.query(sql, (err, result2) => {
                var sql="SELECT * FROM cart WHERE user_id='"+req.session.user_id+"' AND product_id='"+urlData.product_id+"'";
                con.query(sql,(err,result3)=> {
                    isincart = (result3.length>0) ? true:false;
                    data = { 'navlist': result, 'subcategory': result1,'product':result2[0],'islogin':checkLogin(req.session),'isincart':isincart}
                    res.render("user/view_product.ejs",data);
                })
            }) 
        })
    })
})

router.get("/product_list",(req,res)=>{
    urlData = url.parse(req.url,true).query;
    var sql=query.select("category");
    con.query(sql,(err,result)=>{
        var sql=query.select("subcategory");
        con.query(sql,(err,result1)=>{
            var sql = "SELECT * FROM category,subcategory,product WHERE category.category_id=subcategory.cat_id AND subcategory.subcategory_id=product.sub_cat_id AND product.sub_cat_id='"+urlData.subcat_id+"'";
            con.query(sql,(err,result2)=>{
                data={'navlist':result,'subcategory':result1,'products':result2,'islogin':checkLogin(req.session)};
                res.render("user/product_list.ejs",data)
            })
        })
    })
})

router.get("/login",(req,res)=>{
    var sql=query.select("category");
    con.query(sql,(err,result)=>{
        var sql=query.select("subcategory");
        con.query(sql,(err,result1)=>{
            data={'navlist':result,'subcategory':result1,'islogin':checkLogin(req.session)};
            res.render("user/login.ejs",data)
        })
    }) 
})

router.get("/create_account",(req,res)=>{
    var sql=query.select("category");
    con.query(sql,(err,result)=>{
        var sql=query.select("subcategory");
        con.query(sql,(err,result1)=>{
            data={'navlist':result,'subcategory':result1,'islogin':checkLogin(req.session)};
            res.render("user/create_account.ejs",data)
        })
    }) 
})

router.post("/saveuser",(req,res)=>{
    var sql = query.insert("user_tbl",req.body);
    con.query(sql,(err,result)=>{
       res.send(`
       <script>
       alert("Account Created Succesfully");
       window.location.assign("/login");
       </script>`)
    })
})

router.post("/login_process",(req,res)=>{
    id = 10;
    var sql=`SELECT * FROM user_tbl WHERE user_password='${req.body.user_password}' AND email_id='${req.body.user_email}'`;
    con.query(sql,(err,result)=>{
        if(result.length>0){
            req.session.user_id=result[0].user_tbl_id;
            res.send(`
                    <script>
                    alert("Login Succesfully");
                    window.location.assign("/");
                    </script>`);
        }else{
            res.send(`
            <script>
                alert("Invalid");
                window.location.assign("/login");
            </script>`)
        }
    })
}) 

router.get("/cart",(req,res)=>{
    validateLogin(req.session,res);
    var sql=query.select("category");
    con.query(sql,(err,result)=>{
        var sql=query.select("subcategory");
        con.query(sql,(err,result1)=>{
            sql=`SELECT * FROM cart,product WHERE user_id='${req.session.user_id}' AND product.product_id=cart.product_id`;
            console.log("sql",sql);
            con.query(sql,(err,result2)=>{
                console.log("result2",result2);
                data={'navlist':result,'subcategory':result1,'islogin':checkLogin(req.session),'cartdata':result2};
            res.render("user/cart.ejs",data)
            })
        })
    })
})

router.get("/add_to_cart",(req,res)=>{
    validateLogin(req.session,res);
    var urlData=url.parse(req.url,true).query;
    obj={
        'product_id':urlData.product_id,
        'user_id':req.session.user_id,
        'qty':urlData.qty
    }
    var sql=query.insert("cart",obj);
    con.query(sql,(err,result)=>{
        if(urlData.btn=='cart'){
            res.redirect("/view_product?product_id="+urlData.product_id);
        }else{
            res.redirect("/checkout_order");

        }
    })
})

router.post("/changeOtyByAjax",(req,res)=>{
    if(req.body.operation=='plus'){
        var sql = "UPDATE cart SET qty=qty+1 WHERE cart_id='"+req.body.cart_id+"'";
        con.query(sql,(err,result)=>{
            sql="SELECT * FROM cart WHERE cart_id='"+req.body.cart_id+"'";
            con.query(sql,(err,result1)=>{
            ret={
                qty:result1[0].qty,
                'status':'success'
            };
            res.send(ret);
        });
    })
    }
    else{
        var sql="UPDATE cart SET qty=qty-1 WHERE cart_id='"+req.body.cart_id+"'";
        con.query(sql,(err,result)=>{
            sql="SELECT * FROM cart WHERE cart_id='"+req.body.cart_id+"'";
            con.query(sql,(err,result1)=>{
            if(result1[0].qty==0){
                var sql="DELETE FROM cart WHERE cart_id='"+req.body.cart_id+"'";
                con.query(sql,(err,result2)=>{
                    ret={
                        qty:result1[0].qty, 
                        'status':'deleted'
                    };
                    res.send(ret);
                })
            }
            else{
                ret={
                    qty:result1[0].qty,
                    'status':'success'
                };
                res.send(ret);
                }
            })
        })
    }
})

router.get("/checkout_order",(req,res)=>{
    var sql = query.select('category');
    con.query(sql, (err, result) => {
        var sql = query.select("subcategory");
        con.query(sql, (err, result1) => {
            sql=`SELECT * FROM cart,product WHERE user_id='${req.session.user_id}' AND product.product_id=cart.product_id`;
            con.query(sql,(err,result2)=>{
                data={'navlist':result,'subcategory':result1,'islogin':checkLogin(req.session),'cartdata':result2};
            res.render("user/checkout_order.ejs",data)
            })
        })
    })
})

var getCDate = (()=>{
    today=new Date();
    m=today.getMonth()+1;
    if(m<10){
        m="0"+m;
    }
    return today.getFullYear()+'-'+m+'-'+today.getDate();
})

router.post("/place_order",(req,res)=>{
    validateLogin(req.session,res);
    req.body.user_id=req.session.user_id;
    req.body.status='pending';
    req.body.order_date=getCDate()
    var sql=query.insert("order_tbl",req.body);
    con.query(sql,(err,result)=>{
        order_id=result.insertId;
        sql=`SELECT * FROM cart,product WHERE user_id='${req.session.user_id}' AND product.product_id=cart.product_id`;
        con.query(sql,(err,result1)=>{
            // console.log("result====>",result1)
            var sql = "INSERT INTO order_product_details (order_id,product_id,user_id,qty,product_name,product_price,product_company,product_color,product_discription,product_image) VALUES "
            for(i=0;i<result1.length;i++){
                order_product_details = {
                    'order_id':result.insertId,
                    'product_id':result1[i].product_id,
                    'user_id':req.body.user_id,
                    'qty':result1[i].qty,
                    'product_name':result1[i].product_name,
                    'product_price':result1[i].product_price,
                    'product_company':result1[i].product_company,
                    'product_color':result1[i].product_color,
                    'product_discription':result1[i].product_desciption,
                    'product_image':result1[i].product_image
                };
                sql+=`(`;
                objvalues=Object.values(order_product_details);
                for(j=0;j<objvalues.length;j++){
                    if(j!=0)
                        sql+=`,'${objvalues[j]}'`;
                    else
                        sql+=` '${objvalues[j]}'`;
                }
                sql+=`),`;
            }
            sql=sql.slice(0,-1); 
            // console.log("Order product details",sql);
            con.query(sql,(err,result3)=>{
                con.query('DELETE FROM cart WHERE user_id="'+req.body.user_id+'"',(err,result5)=>{
                    res.send(
                        `<script>
                                alert("Order Placed Successfully");
                                window.location.assign("/order_track?order_id=${order_id}");
                        </script>
                    `);
                })                
            })   
        })
    })   
})

router.get("/order_track",(req,res)=>{
    var urlData=url.parse(req.url,true).query;
    var sql=`SELECT * FROM order_tbl WHERE order_tbl_id=${urlData.order_id}`;
    // console.log(sql);
    con.query(sql,(err,result)=>{
        // console.log(result)
        res.render("user/order_track.ejs",{'order_details':result[0]})
    })
}) 

module.exports = router;