var express=require('express');
var router = express.Router();
var query=require("./../../queries");
var con=require("./../../connection");

router.get("/",(req,res)=>{
    res.render('admin/home.ejs');
})
router.get("/category",(req,res)=>{
    var sql=query.select('category');
    con.query(sql,(err,result)=>{
        data={'categoryList':result};
        res.render("admin/category.ejs",data);
    })
})
router.get("/subcategory", (req, res) => {
    var sql = query.select('category');
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Error while fetching subcategories:", err);
            return res.status(500).send("Internal Server Error"); 
        }
        var sql = 'select * from subcategory,category where subcategory.cat_id = category.category_id';
        con.query(sql, (err, result1) => {
            if (err) {
                console.error("Error while fetching subcategories:", err);
                return res.status(500).send("Internal Server Error"); 
            }
            var data = { 'catlist': result,'subcatlist':result1 };
            res.render("admin/subcategory.ejs", data);
            // console.log(data);
        });

    });
       
});

router.post("/savecategory",(req,res)=>{
    var sql=query.insert("category",req.body);
    con.query(sql,(err,result)=>{ 
        if (err) {
            console.error("Error while adding categories:", err);
            return res.status(500).send("Internal Server Error"); 
        }       
        data={'categoryList':result};
        res.redirect("/admin/category")
    })
})
router.post("/savesubcategory",(req,res)=>{
    var sql=`insert into subcategory (cat_id,sub_cat_name) values (${req.body.cat_id},'${req.body.sub_cat_name}')`;
    con.query(sql,(err,result)=>{
        if (err) {
            console.error("Error while adding subcategories:", err);
            return res.status(500).send("Internal Server Error"); 
        }
        data={'subcategoryList':result};
        res.redirect("/admin/subcategory");
    })
      
})
router.get("/slider",(req,res)=>{
    var sql = query.select('slider');
    con.query(sql,(err,images)=> {
        data={'slider_image':images}
        res.render("admin/slider.ejs",data);
    })
})
router.post("/saveslider",(req,res)=>{
    var slider_img = req.files.slider_image;
    var img_name = new Date().getTime()+slider_img.name;
    slider_img.mv("public/uploads/"+img_name,(err)=>{
        console.log(err);
    })
    req.body.slider_image=img_name;
    var sql=query.insert("slider",req.body);
    con.query(sql,(err,result)=>{
        if (err) {
            console.error("Error while adding subcategories:", err);
            return res.status(500).send("Internal Server Error"); 
        }
        data={'slider_image':result};
        res.redirect("/admin/slider");
    })
});

router.get("/product",(req,res)=>{
    var sql=query.select('category');
    con.query(sql,(err,result)=>{
        data={'catlist':result}
        res.render("admin/product.ejs",data);
    })
});

router.post("/getSubcategory_by_ajax",(req,res)=>{
    var sql="SELECT * FROM subcategory WHERE cat_id='"+req.body.cat_id+"'";
    con.query(sql,(err,catlist)=>{      
        res.send(catlist);
    })
})

router.post("/save_product",(req,res)=>{    
    var product_image = req.files.product_image;
    var img_name = new Date().getTime()+product_image.name;
    product_image.mv("public/uploads/"+img_name,(err)=>{
        console.log(err);
    });
    req.body.product_image=img_name;
    // sql=query.create("product",req.body);
    sql=query.insert("product",req.body);  
    con.query(sql,(err,result)=>{
        // console.log(req.body);
        res.send(`<script>
            alert('Product Added');
            location.assign('/admin/product');
        </script>`)
    })
})

router.get("/product_list",(req,res)=>{
    var sql = "SELECT * FROM category,subcategory,product WHERE category.category_id=subcategory.cat_id AND subcategory.subcategory_id=product.sub_cat_id";
    con.query(sql,(err,result)=>{
        res.render("admin/product_list.ejs",{'products':result});
    })
})

module.exports=router;