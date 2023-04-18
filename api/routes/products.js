const express = require('express')
const router = express.Router()

// Deal with file
const fileSystem = require('fs');

// Upload and store images
const multer = require('multer')

const storage = multer.diskStorage({
    // Place of picture
    destination: (request, file, callback) => {
        callback(null, 'storage_product/');
    },
    filename: (request, file, callback) => {
        const avatarName = Date.now() + file.originalname;
        callback(null, avatarName);
    }
});

const uploadImage = multer({
    storage: storage,
});


// import file
const database = require("../../config")
const checkAuth = require('../../middleware/check_auth');


// Get All products
router.get("/all", (request, response) => {
    var page = request.query.page;
    var page_size = request.query.page_size;

    if(page == null || page < 1){
        page = 1;
    }
 
    if(page_size == null){
        page_size = 20;
    }

    // OFFSET starts from zero
    page = page - 1;
    // OFFSET * LIMIT
    page = page * page_size;

    const args = [
        parseInt(page_size),
        parseInt(page)
    ];
    
    const query = "SELECT * FROM product LIMIT ? OFFSET ?"
    database.query(query,args, (error, result) => {
        if(error) throw error;
        response.status(200).json({
            "page": page + 1,
            "error" : false,
            "products" : result
        })
    })
});

//Get category
router.get("/category", (request, response) => {
    const query ="SELECT DISTINCT category FROM product"
    database.query(query, (error, result) => {
        if(error) throw error
        response.status(200).json({
            "listCategory" : result
        })
    });
})
//Get all product by category
router.get("/probycate", (request, response) => {
    const category = request.query.category
    const query ="SELECT * FROM product WHERE category = ? ";
    const args = [
        category
    ];
    database.query(query, args, (error, result) => {
        if(error) throw error
        response.status(200).json({
            "listProductbyCate" : result
        })
    });
})
// Get products by category
router.get("/", (request, response) => {
    const user_id = request.query.userId;
    const category = request.query.category
    var page = request.query.page;
    var page_size = request.query.page_size;


    if(page == null || page < 1){
        page = 1;
    }
 
    if(page_size == null){
        page_size = 20;
    }

    // OFFSET starts from zero
    const offset = page - 1;
    // OFFSET * LIMIT
    page = offset * page_size; // 20

    const args = [
        user_id,
        user_id,
        category,
        parseInt(page_size),
        parseInt(page)
    ];

    //const query = "SELECT * FROM product WHERE category = ? LIMIT ? OFFSET ?";
    const query = `SELECT product.id,
    product.product_name,
    product.price,
    product.priceold,
    product.quantity,
    product.sold,
    product.supplier,
    product.image,
    product.category,
    product.describe,
    product.trademark,
    product.origin,
    product.sex,
    product.skinproblems,
    product.addtocart,
    product.addtofavorite,
    product.share,
    product.rain,
    product.active,
    (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM favorite WHERE favorite.user_id = ? AND favorite.product_id = product.id) as isFavourite,
    (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM cart WHERE cart.user_id = ? AND cart.product_id = product.id) as isInCart
    FROM product 
    WHERE category = ? 
    LIMIT ? OFFSET ?`;

    database.query(query, args, (error, result) => {
        if(error) throw error
        response.status(200).json({
            "page": offset + 1,  //2
            "error" : false,
            "products" : result
        })
    });
}); 
// Get product by id
router.get("/productdetail/:id", (request, response) => {
    const id = request.params.id;
    const query = "SELECT * FROM product WHERE id = ?"
    const args = [id]
    database.query(query, args, (error, result) => {
        if(error) throw error
        response.status(200).json({
            "products" : result
        })
    });
});
// Search for products
router.get("/search", (request, response) => {
    const user_id = request.query.userId;
    const keyword = request.query.q.toLowerCase();
    var page = request.query.page;
    var page_size = request.query.page_size;

    if(page == null || page < 1){
        page = 1;
    }
 
    if(page_size == null){
        page_size = 20;
    }

    // OFFSET starts from zero
    page = page - 1;
    // OFFSET * LIMIT
    page = page * page_size;

    const searchQuery = '%' + keyword + '%';

    const args = [
        user_id,
        user_id,
        searchQuery,
        searchQuery,
        parseInt(page_size),
        parseInt(page)
    ];

    //const query = "SELECT * FROM product WHERE product_name LIKE ? OR category LIKE ? LIMIT ? OFFSET ?";

    const query = `SELECT product.id,
    product.product_name,
    product.price,
    product.priceold,
    product.quantity,
    product.sold,
    product.supplier,
    product.image,
    product.category,
    product.describe,
    product.trademark,
    product.origin,
    product.sex,
    product.skinproblems,
    product.addtocart,
    product.addtofavorite,
    product.share,
    product.rain,
    product.active,
    (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM favorite WHERE favorite.user_id = ? AND favorite.product_id = product.id) as isFavourite,
    (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM cart WHERE cart.user_id = ? AND cart.product_id = product.id) as isInCart
    FROM product 
    WHERE product_name LIKE ? OR category LIKE ?
    LIMIT ? OFFSET ?`;


    database.query(query, args, (error, result) => {
        if(error) throw error
        response.status(200).json({
            "page": page + 1,
            "error" : false,
            "products" : result
        })
    });
}); 

// Insert Product
router.post("/insert", checkAuth, uploadImage.single('image'), (request, response) => {
    const name = request.body.name
    const price = request.body.price
    const quantity = request.body.quantity
    const supplier = request.body.supplier
    const category = request.body.category
    const describe = request.body.describe
    const trademark = request.body.trademark
    const origin = request.body.origin
    const sex = request.body.sex
    const skinproblems = request.body.skinproblems

    
    const file = request.file;
    var filePath = ""
    if(file != null){
        filePath = file.path
    }
   
    const query = "INSERT INTO product(product_name, price, quantity, supplier, category, image, describe, trademark, origin, sex, skinproblems, active) VALUES(?, ?, ?, ?, ?,?)"
        
    const args = [name, price, quantity, supplier, category, filePath, describe, trademark, origin,sex, skinproblems, 1 ]

        database.query(query, args, (error, result) => {
            if (error) throw error
            response.status(200).send("Product Inserted")
        });
});

// Delete Product
router.delete("/:id", (request, response) => {
    const id = request.params.id;
    const query = "UPDATE product SET active=0 WHERE id=?"

    const args = [id]

    database.query(query, args, (error, result) => {
        if(error) throw error
        response.status(200).send("Product is deleted")
    });
});

// Update image of product
router.put("/update", uploadImage.single('image'), (request, response) => {
    const id = request.body.id;
    
    const file = request.file;
    var filePath = ""
    if(file != null){
        filePath = file.path
    }

    const selectQuery = "SELECT image FROM product WHERE id = ?"
    database.query(selectQuery, id, (error, result) => {

        console.log(result)
        if(error) throw error
        try {
            // Get value from key image
            var image = result[0]['image'];
            // Delete old image 
            fileSystem.unlinkSync(image);
        } catch (err) {
            console.error("Can't find file in storage/pictures Path");
        }
    });

    const query = "UPDATE product SET image = ? WHERE id = ?"  
    
    const args = [filePath,id]

    database.query(query, args, (error, result) => {
        if(error) throw error

        if(result['affectedRows']  == 1){
            response.status(200).send("Product Image is updated")
        }else{
            response.status(500).send("Invalid Update")
        }
    });

});
//Nhung san pham dược yêu thích
router.get("/favorite", (request, response) => {
    const user_id = request.query.userId;
    var page = request.query.page;
    var page_size = request.query.page_size;

    if(page == null || page < 1){
        page = 1;
    }
 
    if(page_size == null){
        page_size = 20;
    }

    // OFFSET starts from zero
    const offset = page - 1;
    // OFFSET * LIMIT
    page = offset * page_size;

    const args = [
        user_id,
        user_id,
        parseInt(page_size),
        parseInt(page)
    ];

    const query = `SELECT product.id,
    product.product_name,
    product.price,
    product.priceold,
    product.quantity,
    product.sold,
    product.supplier,
    product.image,
    product.category,
    product.describe,
    product.trademark,
    product.origin,
    product.sex,
    product.skinproblems,
    product.addtocart,
    product.addtofavorite,
    product.share,
    product.rain,
    product.active,
    (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM favorite WHERE favorite.user_id = ? AND favorite.product_id = product.id) as isFavourite,
    (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM cart WHERE cart.user_id = ? AND cart.product_id = product.id) as isInCart
    FROM product 
    ORDER BY addtofavorite DESC
    LIMIT ? OFFSET ?`;

    database.query(query, args, (error, result) => {
        if(error) throw error
        response.status(200).json({
            "page": offset + 1,
            "error" : false,
            "products" : result
        })
    });
});
//Nhung san pham dược quan tâm nhiều nhất
router.get("/cart", (request, response) => {
    const user_id = request.query.userId;
    var page = request.query.page;
    var page_size = request.query.page_size;

    if(page == null || page < 1){
        page = 1;
    }
 
    if(page_size == null){
        page_size = 20;
    }

    // OFFSET starts from zero
    const offset = page - 1;
    // OFFSET * LIMIT
    page = offset * page_size;

    const args = [
        user_id,
        user_id,
        parseInt(page_size),
        parseInt(page)
    ];

    const query = `SELECT product.id,
    product.product_name,
    product.price,
    product.priceold,
    product.quantity,
    product.sold,
    product.supplier,
    product.image,
    product.category,
    product.describe,
    product.trademark,
    product.origin,
    product.sex,
    product.skinproblems,
    product.addtocart,
    product.addtofavorite,
    product.share,
    product.rain,
    product.active,
    (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM favorite WHERE favorite.user_id = ? AND favorite.product_id = product.id) as isFavourite,
    (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM cart WHERE cart.user_id = ? AND cart.product_id = product.id) as isInCart
    FROM product 
    ORDER BY addtocart DESC
    LIMIT ? OFFSET ?`;

    database.query(query, args, (error, result) => {
        if(error) throw error
        response.status(200).json({
            "page": offset + 1,
            "error" : false,
            "products" : result
        })
    });
});
//Nhung san pham dược chia sẻ nhiều nhất
router.get("/share", (request, response) => {
    const user_id = request.query.userId;
    var page = request.query.page;
    var page_size = request.query.page_size;

    if(page == null || page < 1){
        page = 1;
    }
 
    if(page_size == null){
        page_size = 20;
    }

    // OFFSET starts from zero
    const offset = page - 1;
    // OFFSET * LIMIT
    page = offset * page_size;

    const args = [
        user_id,
        user_id,
        parseInt(page_size),
        parseInt(page)
    ];

    const query = `SELECT product.id,
    product.product_name,
    product.price,
    product.priceold,
    product.quantity,
    product.sold,
    product.supplier,
    product.image,
    product.category,
    product.describe,
    product.trademark,
    product.origin,
    product.sex,
    product.skinproblems,
    product.addtocart,
    product.addtofavorite,
    product.share,
    product.rain,
    product.active,
    (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM favorite WHERE favorite.user_id = ? AND favorite.product_id = product.id) as isFavourite,
    (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM cart WHERE cart.user_id = ? AND cart.product_id = product.id) as isInCart
    FROM product 
    ORDER BY share DESC
    LIMIT ? OFFSET ?`;

    database.query(query, args, (error, result) => {
        if(error) throw error
        response.status(200).json({
            "page": offset + 1,
            "error" : false,
            "products" : result
        })
    });
})
//Nhung san pham dược mua nhiều nhất
router.get("/sold", (request, response) => {
    const user_id = request.query.userId;
    var page = request.query.page;
    var page_size = request.query.page_size;

    if(page == null || page < 1){
        page = 1;
    }
 
    if(page_size == null){
        page_size = 20;
    }

    // OFFSET starts from zero
    const offset = page - 1;
    // OFFSET * LIMIT
    page = offset * page_size;

    const args = [
        user_id,
        user_id,
        parseInt(page_size),
        parseInt(page)
    ];

    const query = `SELECT product.id,
    product.product_name,
    product.price,
    product.priceold,
    product.quantity,
    product.sold,
    product.supplier,
    product.image,
    product.category,
    product.describe,
    product.trademark,
    product.origin,
    product.sex,
    product.skinproblems,
    product.addtocart,
    product.addtofavorite,
    product.share,
    product.rain,
    product.active,
    (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM favorite WHERE favorite.user_id = ? AND favorite.product_id = product.id) as isFavourite,
    (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM cart WHERE cart.user_id = ? AND cart.product_id = product.id) as isInCart
    FROM product 
    ORDER BY sold DESC
    LIMIT ? OFFSET ?`;

    database.query(query, args, (error, result) => {
        if(error) throw error
        response.status(200).json({
            "page": offset + 1,
            "error" : false,
            "products" : result
        })
    });
})
//Nhung san pham chat luong cao
router.get("/rain", (request, response) => {
    const user_id = request.query.userId;
    var page = request.query.page;
    var page_size = request.query.page_size;

    if(page == null || page < 1){
        page = 1;
    }
 
    if(page_size == null){
        page_size = 20;
    }

    // OFFSET starts from zero
    const offset = page - 1;
    // OFFSET * LIMIT
    page = offset * page_size;

    const args = [
        user_id,
        user_id,
        parseInt(page_size),
        parseInt(page)
    ];

    const query = `SELECT product.id,
    product.product_name,
    product.price,
    product.priceold,
    product.quantity,
    product.sold,
    product.supplier,
    product.image,
    product.category,
    product.describe,
    product.trademark,
    product.origin,
    product.sex,
    product.skinproblems,
    product.addtocart,
    product.addtofavorite,
    product.share,
    product.rain,
    product.active,
    (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM favorite WHERE favorite.user_id = ? AND favorite.product_id = product.id) as isFavourite,
    (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM cart WHERE cart.user_id = ? AND cart.product_id = product.id) as isInCart
    FROM product 
    ORDER BY rain DESC
    LIMIT ? OFFSET ?`;

    database.query(query, args, (error, result) => {
        if(error) throw error
        response.status(200).json({
            "page": offset + 1,
            "error" : false,
            "products" : result
        })
    });
})
// flash sale
router.get("/flashsale", (request, response) => {
    const user_id = request.query.userId;
    var page = request.query.page;
    var page_size = request.query.page_size;

    if (page == null || page < 1) {
        page = 1;
    }

    if (page_size == null) {
        page_size = 20;
    }

    // OFFSET starts from zero
    const offset = page - 1;
    // OFFSET * LIMIT
    page = offset * page_size; // 20

    const args = [
        user_id,
        user_id,
        parseInt(page_size),
        parseInt(page)
    ];

    const query = `SELECT product.id,
        product.product_name,
        product.price,
        product.priceold,
        product.quantity,
        product.sold,
        product.supplier,
        product.image,
        product.category,
        product.describe,
        product.trademark,
        product.origin,
        product.sex,
        product.skinproblems,
        product.addtocart,
        product.addtofavorite,
        product.share,
        product.rain,
        product.active,
        (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM favorite WHERE favorite.user_id = ? AND favorite.product_id = product.id) as isFavourite,
        (SELECT IF(COUNT(*) >= 1, TRUE, FALSE) FROM cart WHERE cart.user_id = ? AND cart.product_id = product.id) as isInCart
        FROM product 
        WHERE price < priceold
        ORDER BY ((priceold - price) / priceold) DESC
        LIMIT ? OFFSET ?`;

    database.query(query, args, (error, result) => {
        if (error) throw error
        response.status(200).json({
            "page": offset + 1,
            "error": false,
            "products": result
        })
    });
});

module.exports = router