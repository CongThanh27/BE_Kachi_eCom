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

    if (page == null || page < 1) {
        page = 1;
    }

    if (page_size == null) {
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
    database.query(query, args, (error, result) => {
        if (error) throw error;
        response.status(200).json({
            "page": page + 1,
            "error": false,
            "products": result
        })
    })
});

//Get category
router.get("/category", (request, response) => {
    const query = "SELECT DISTINCT category FROM product"
    database.query(query, (error, result) => {
        if (error) throw error
        response.status(200).json({
            "listCategory": result
        })
    });
})
//Get all product by category
router.get("/probycate", (request, response) => {
    const category = request.query.category
    const query = "SELECT * FROM product WHERE category = ? ";
    const args = [
        category
    ];
    database.query(query, args, (error, result) => {
        if (error) throw error
        response.status(200).json({
            "listProductbyCate": result
        })
    });
})
// Get products by category
router.get("/", (request, response) => {
    const user_id = request.query.userId;
    const category = request.query.category
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
    product.description,
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
        if (error) throw error
        response.status(200).json({
            "page": offset + 1,  //2
            "error": false,
            "products": result
        })
    });
});
// Get product by id
router.get("/productdetail/:id", (request, response) => {
    const id = request.params.id;
    const query = "SELECT * FROM product WHERE id = ?"
    const args = [id]
    database.query(query, args, (error, result) => {
        if (error) throw error
        response.status(200).json({
            "products": result
        })
    });
});
// Search for products
router.get("/search", (request, response) => {
    const user_id = request.query.userId;
    const keyword = request.query.q.toLowerCase();
    var page = request.query.page;
    var page_size = request.query.page_size;

    if (page == null || page < 1) {
        page = 1;
    }

    if (page_size == null) {
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
    product.description,
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
        if (error) throw error
        response.status(200).json({
            "page": page + 1,
            "error": false,
            "products": result
        })
    });
});

// Insert Product
router.post("/insert", uploadImage.single('image'), (request, response) => {
    const name = request.body.name
    const price = request.body.price
    const quantity = request.body.quantity
    const supplier = request.body.supplier
    const category = request.body.category
    const description = request.body.describe
    const trademark = request.body.trademark
    const origin = request.body.origin
    const sex = request.body.sex
    const skinproblems = request.body.skinproblems


    const file = request.file;
    var filePath = ""
    if (file != null) {
        filePath = file.path
    }

    const query = "INSERT INTO product(product_name, price, quantity, supplier, category, image, description, trademark, origin, sex, skinproblems, active,share,addtofavorite,rain,addtocart,priceold,sold) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

    const args = [name, price, quantity, supplier, category, filePath, description, trademark, origin, sex, skinproblems, 1, null, null, null, null, price, 0]

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
        if (error) throw error
        response.status(200).send("Product is deleted")
    });
});

// Update image of product
router.put("/update", uploadImage.single('image'), (request, response) => {
    const id = request.body.id;
    const file = request.file;
    var filePath = ""
    if (file != null) {
        filePath = file.path
    }

    const selectQuery = "SELECT image FROM product WHERE id = ?"
    database.query(selectQuery, id, (error, result) => {

        console.log(result)
        if (error) throw error
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

    const args = [filePath, id]

    database.query(query, args, (error, result) => {
        if (error) throw error

        if (result['affectedRows'] == 1) {
            response.status(200).send("Product Image is updated")
        } else {
            response.status(500).send("Invalid Update")
        }
    });

});
//Nhung san pham dược yêu thích
router.get("/favorite", (request, response) => {
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
    product.description,
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
        if (error) throw error
        response.status(200).json({
            "page": offset + 1,
            "error": false,
            "products": result
        })
    });
});
//Nhung san pham dược quan tâm nhiều nhất
router.get("/cart", (request, response) => {
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
    product.description,
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
        if (error) throw error
        response.status(200).json({
            "page": offset + 1,
            "error": false,
            "products": result
        })
    });
});
//Nhung san pham dược chia sẻ nhiều nhất
router.get("/share", (request, response) => {
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
    product.description,
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
        if (error) throw error
        response.status(200).json({
            "page": offset + 1,
            "error": false,
            "products": result
        })
    });
})
//Nhung san pham dược mua nhiều nhất
router.get("/sold", (request, response) => {
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
    product.description,
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
        if (error) throw error
        response.status(200).json({
            "page": offset + 1,
            "error": false,
            "products": result
        })
    });
})
//Nhung san pham chat luong cao
router.get("/rate", (request, response) => {
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
    product.description,
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
        if (error) throw error
        response.status(200).json({
            "page": offset + 1,
            "error": false,
            "products": result
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
        product.description,
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

// Get All products not phân trang
router.get("/AdAll", (request, response) => {
    const query = `SELECT * FROM product `
    database.query(query, (error, result) => {
        if (error) throw error
        response.status(200).json({
            "products": result
        })
    });
});

// Ad Update product
//thực hiện việc lấy đường dẫn của tệp ảnh của một sản phẩm dựa trên id và sau đó xóa tệp ảnh đó.
//Việc xóa tệp ảnh cũ là cần thiết để tránh việc lưu trữ nhiều tệp ảnh không cần thiết trong hệ thống.
//Nó giúp tối ưu hóa lưu trữ và đảm bảo rằng chỉ có tệp ảnh mới nhất được lưu trữ trong hệ thống.
//Xóa tệp ảnh của sản phẩm bằng cách sử dụng hàm unlinkSync của fs (file system module) trong Node.js
// if(result['affectedRows'] == 1){...}else{...}: 
// Kết quả truy vấn được trả về trong biến result bao gồm số 
// lượng bản ghi ảnh hưởng bởi truy vấn (thường là số lượng bản ghi được cập nhật).
// Nếu affectedRows là 1, nghĩa là truy vấn đã cập nhật thành công một bản ghiF
//product_name: currentProductName -> lấy giá trị thuộc tính product_name từ result[0] và gán vào biến currentProductName
router.put("/adupdate", uploadImage.single('image'), (request, response) => {
    const id = request.body.id;
    const { 
        product_name, 
        price, 
        priceold, 
        quantity, 
        sold, 
        supplier, 
        category, 
        description, 
        trademark, 
        origin, 
        sex, 
        skinproblems, 
        addtocart, 
        addtofavorite, 
        share, 
        rain, 
        active 
    } = request.body;
    const file = request.file;
    var filePath = ""
    if (file != null) {
        filePath = file.path
    }
    // Lấy thông tin sản phẩm hiện có trong database
    const selectQuery = "SELECT * FROM product WHERE id = ?";
    database.query(selectQuery, id, (error, result) => {
        if (error) throw error;
        // Lấy giá trị của các thuộc tính hiện tại
        const {
            product_name: currentProductName,
            price: currentPrice,
            priceold: currentPriceOld,
            quantity: currentQuantity,
            sold: currentSold,
            supplier: currentSupplier,
            image: currentImage,
            category: currentCategory,
            description: currentDescribe,
            trademark: currentTrademark,
            origin: currentOrigin,
            sex: currentSex,
            skinproblems: currentSkinProblems,
            addtocart: currentAddToCart,
            addtofavorite: currentAddToFavorite,
            share: currentShare,
            rain: currentRain,
            active: currentActive,
        } = result[0];
        // Sử dụng giá trị từ database nếu các thuộc tính bị thiếu
        const updatedProductName = product_name || currentProductName;
        const updatedPrice = price || currentPrice;
        const updatedPriceOld = priceold || currentPriceOld;
        const updatedQuantity = quantity || currentQuantity;
        const updatedSold = sold || currentSold;
        const updatedSupplier = supplier || currentSupplier;
        const updatedCategory = category || currentCategory;
        const updatedDescribe = description|| currentDescribe;
        const updatedTrademark = trademark || currentTrademark;
        const updatedOrigin = origin || currentOrigin;
        const updatedSex = sex || currentSex;
        const updatedSkinProblems = skinproblems || currentSkinProblems;
        const updatedAddToCart = addtocart || currentAddToCart;
        const updatedAddToFavorite = addtofavorite || currentAddToFavorite;
        const updatedShare = share || currentShare;
        const updatedRain = rain || currentRain;
        const updatedActive = active || currentActive;
        const selectQuery = "SELECT image FROM product WHERE id = ?"
        database.query(selectQuery, id, (error, result) => {
            console.log(result)
            if (error) throw error
            try {
                // Get value from key image
                var image = result[0]['image'];
                fileSystem.unlinkSync(image);
            } catch (err) {
                console.error("Can't find file in storage/pictures Path");
            }
        });
        const query = "UPDATE product SET product_name = ?, price = ?, priceold = ?, quantity = ?, sold = ?, supplier = ?, image = ?, category = ?, description= ?, trademark = ?, origin = ?, sex = ?, skinproblems = ?, addtocart = ?, addtofavorite = ?, share = ?, rain = ?, active = ? WHERE id = ?";
        const args = [
            updatedProductName,
            updatedPrice,
            updatedPriceOld,
            updatedQuantity,
            updatedSold,
            updatedSupplier,
            filePath || currentImage,
            updatedCategory,
            updatedDescribe,
            updatedTrademark,
            updatedOrigin,
            updatedSex,
            updatedSkinProblems,
            updatedAddToCart,
            updatedAddToFavorite,
            updatedShare,
            updatedRain,
            updatedActive,
            id
        ];
        database.query(query, args, (error, result) => {
            if (error) throw error
            if (result['affectedRows'] == 1) {
                response.status(200).send("Product is updated")
            } else {
                response.status(500).send("Invalid Update")
            }
        });
    });
});

//Thống kê top 10 sản phẩm bán chạy nhất
router.get("/top10banchay", (request, response) => {
    const query = `SELECT * FROM product ORDER BY sold DESC`
    database.query(query, (error, result) => {
        if (error) throw error
        response.status(200).json({
            "products": result
        })
    });

})
//Thống kê top 10 sản phẩm được yêu thích nhất
router.get("/top10yeuthich", (request, response) => {
    const query = `SELECT * FROM product ORDER BY addtofavorite DESC`
    database.query(query, (error, result) => {
        if (error) throw error
        response.status(200).json({
            "products": result
        })
    });

})
//Thống kê top 10 sản phẩm được chia sẻ nhiều nhất
router.get("/top10chiase", (request, response) => {
    const query = `SELECT * FROM product ORDER BY share DESC`
    database.query(query, (error, result) => {
        if (error) throw error
        response.status(200).json({
            "products": result
        })
    });

})
//Thống kê top 10 sản phẩm đánh giá cao
router.get("/top10danhgia", (request, response) => {
    const query = `SELECT * FROM product ORDER BY rain DESC`
    database.query(query, (error, result) => {
        if (error) throw error
        response.status(200).json({
            "products": result
        })
    });

})

router.get("/CountStatus", (request, response) => {
    const query = `
        SELECT status, COUNT(*) AS count
        FROM ordering
        GROUP BY status
    `
    database.query(query, (error, result) => {
        if (error) throw error;
        response.status(200).json({
            "statusCounts": result
        });
    });
});

module.exports = router