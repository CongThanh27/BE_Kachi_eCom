const express = require('express')
const router = express.Router()

// import file
const database = require("../../config")

const util = require('../../utils/mail');
const util2 = require('../../utils/encrypt');
//biểu đồ 
router.get("/CountStatus", (request, response) => {
    const status = request.query.status;
    const query = `
        SELECT status AS kq, 
        COUNT(*) AS price
        FROM Ordering
        WHERE Ordering.status =  ?
        GROUP BY status
    `
    const args = [status];
    database.query(query, args, (error, result) => {
        if (error) throw error;
        response.status(200).json({
            "thongke": result
        });
    });
})
// Order a product
router.post("/add", (request, response) => {
    var status = request.body.status
    const name_on_card = request.body.name_on_card
    var card_number = request.body.card_number
    const expiration_date = request.body.expiration_date
    const userId = request.body.userId
    const productId = request.body.productId
    const quantity = request.body.quantity
    const order_number = request.body.random;
    const address = request.body.address;
    const phone = request.body.phone;
    // const shipping_id = request.body.shipping_id;
    const capnhat =`UPDATE Product SET quantity = quantity - 1,  sold =sold+1 WHERE id = ?`
    const args1 = [productId]
    card_number = util2.encrypt(card_number)

    const queryCategory = 'SELECT category FROM product WHERE id = ?'
    database.query(queryCategory, productId, (error, result) => {
        if (error) throw error;
        result = result[0]["category"]
        if (typeof status == 'undefined' && status == null) {
            status = "1";
        }
        const query = "INSERT INTO Ordering(order_number, order_date ,status,name_on_card, card_number,expiration_date,user_id, product_id,quantity,address,phone) VALUES(?,NOW(),?,?,?,?,?,?,?,?,?)"
        const args = [order_number, status, name_on_card, card_number, expiration_date, userId, productId, quantity, address, phone]

        database.query(query, args, (error, result) => {
            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {

                    response.status(500).send("Deplicate Entry")
                } else {
                    throw error;
                }
            } else {
                //Xóa sản phẩm trong giỏ hàng
                const querydelete = "DELETE FROM cart WHERE user_id = ? AND product_id = ?"
                const argsdelete = [userId, productId]
                database.query(querydelete, argsdelete, (error, result) => {
                    if (error) {
                        throw error;
                    } else {
                        console.log("Xóa sản phẩm trong giỏ hàng thành công")
                    }
                })
                response.status(200).send("You ordered a product")
                database.query(capnhat, args1, (error, result) => {
                    if (error) {
                        throw error;
                    } else {
                        console.log("Cập nhật số lượng sản phẩm thành công")
                    }
                })
            }
        });


    })
});

router.get("/", (request, response) => {
    const productId = request.body.id

    var order_number;

    const queryCategory = 'SELECT category FROM product WHERE id = ?'
    database.query(queryCategory, productId, (error, result) => {
        if (error) throw error;

        result = result[0]["category"]

        console.log(result)

        if (result === "mobile") {
            console.log('hello')
            order_number = 55 + getRandomInt(100000, 999999)
        } else if (result == "laptop") {
            order_number = 66 + getRandomInt(100000, 999999)
        } else if (result == "baby") {
            order_number = 77 + getRandomInt(100000, 999999)
        } else if (result == "toy") {
            order_number = 88 + getRandomInt(100000, 999999)
        }

        response.status(200).json({
            "category": result
        })
    });

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
});

// Get Orders
router.get("/get", (request, response) => {
    var userId = request.query.userId;
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
        userId,
        parseInt(page_size),
        parseInt(page)
    ];


    const query = `SELECT 
    Ordering.order_number,
    DATE_FORMAT(Ordering.order_date, '%d/%m/%Y') AS order_date, 
    Ordering.status,
    User.name,
    Shipping.address,
    Shipping.phone,
    SUM(Product.price * Ordering.quantity) AS price,
    GROUP_CONCAT(Product.product_name SEPARATOR ', ') AS product_names
FROM 
    Ordering 
    JOIN User ON Ordering.user_id = User.id 
    JOIN Shipping ON Ordering.product_id = Shipping.product_id
    JOIN Product ON Ordering.product_id = Product.id 
WHERE 
    Ordering.user_id = ?
GROUP BY 
    Ordering.order_number
`

    database.query(query, args, (error, orders) => {
        if (error) throw error;
        response.status(200).json({
            "page": offset + 1,
            "error": false,
            "orders": orders
        })

    })
});

router.get("/AdAll", (request, response) => {
    const query = `SELECT * FROM ordering `
    database.query(query, (error, result) => {
        if (error) throw error
        response.status(200).json({
            "orders": result
        })
    });
});
//truyền vào id của user và order_number in ra list sản phẩm
router.get("/getProducts", (request, response) => {
    const userId = request.query.userId;
    const order_number = request.query.order_number;
    const query = `SELECT Ordering.order_number,
                          DATE_FORMAT(Ordering.order_date, '%d/%m/%Y') AS order_date, 
                          Ordering.status,
                          Ordering.quantity,
                          Ordering.address,
                        Ordering.phone,
                          Product.product_name,
                          Product.price,
                          Product.id,
                          Product.image                        
                   FROM Ordering
                  
                   JOIN Product ON Ordering.product_id = Product.id                              
                   WHERE Ordering.order_number = ?`;
    const args = [order_number];
    database.query(query, args, (error, products) => {
        if (error) throw error;
        response.status(200).json({
            "error": false,
            "productsinorder": products
        })
    });
});
//api truyền vào mã sô đơn hàng và trả về thông tin đơn hàng
router.get("/getAdmin", (request, response) => {
    const query = `SELECT 
    Ordering.order_number,
    DATE_FORMAT(Ordering.order_date, '%d/%m/%Y') AS order_date, 
    Ordering.status,
    User.name,
    Ordering.address,
    Ordering.phone,
    SUM(Product.price * Ordering.quantity) AS price,
    GROUP_CONCAT(Product.product_name SEPARATOR ', ') AS product_names
    FROM 
    Ordering 
    JOIN Product ON Ordering.product_id = Product.id 
    JOIN User ON Ordering.user_id = User.id 
    GROUP BY 
    Ordering.order_number;
`
    database.query(query, (error, orders) => {
        if (error) throw error;
        response.status(200).json({
            "orders": orders
        })

    })
});
router.get("/getProductsAdmin", (request, response) => {
    const order_number = request.query.order_number;
    const query = `SELECT Ordering.order_number,
                          DATE_FORMAT(Ordering.order_date, '%d/%m/%Y') AS order_date, 
                          Ordering.status,
                          Ordering.quantity,
                          Product.product_name,
                          Product.price,
                          Product.id,
                          Product.image                        
                   FROM Ordering
                   JOIN Product ON Ordering.product_id = Product.id                              
                   WHERE Ordering.order_number = ?`;
    const args = [order_number];
    database.query(query, args, (error, products) => {
        if (error) throw error;
        response.status(200).json({
            "productsinorder": products
        })
    });
});
//truyền vào order_number set status =0
router.put("/huydonhang", (request, response) => {
    const order_number = request.query.order_number;
    const query = `UPDATE Ordering SET status = 0 WHERE order_number = ?`;
    const query1 = `UPDATE Ordering SET status = 1 WHERE order_number = ?`;
    
    const args = [ order_number];
    const status=1;
    // Tìm đơn hàng có order_number kiểm tra status nếu status = 1  dùng query, nếu status = 0 thì dùng query1
    const query2 = `SELECT status FROM Ordering WHERE order_number = ?`;
    const args2 = [order_number];
    database.query(query2, args2, (error, result) => {
        if (error) throw error;
        if (result[0]["status"] == status) {
            database.query(query, args, (error, result) => {
                if (error) {
                    if (error.code === 'ER_DUP_ENTRY') {
                        response.status(500).send("Deplicate Entry")
                    } else {
                        throw error;
                    }
                }
                response.status(200).send("Đã hủy đơn hàng")
            });
        }
        else{
            database.query(query1, args, (error, result) => {
                if (error) {
                    if (error.code === 'ER_DUP_ENTRY') {
                        response.status(500).send("Deplicate Entry")
                    } else {
                        throw error;
                    }
                }
                response.status(200).send("Đơn hàng sẽ sớm được giao lại, Cảm ơn quý khách!")
            });
        }
        
    })



});
// cập nhật status đơn hàng
//truyền vào order_number set status =0
router.put("/adminupdatestatus", (request, response) => {
    const order_number = request.query.order_number;
    const status = request.query.status;
    const query = `UPDATE Ordering SET status = ? WHERE order_number = ?`;
    const args = [status, order_number];
    database.query(query, args, (error, result) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                response.status(500).send("Deplicate Entry")
            } else {
                throw error;
            }
        }
        response.status(200).send("Thành công")
    });
});
//Thống kê doanh thu theo năm
//Thống kê tổng số đơn hàng theo tháng
router.get("/thongkesodonhang", (request, response) => {
    const query = `SELECT 
    MONTH(Ordering.order_date) AS month,
    COUNT(Ordering.order_number) AS order_number
    FROM
    Ordering
    WHERE Ordering.status = 4
    GROUP BY MONTH(Ordering.order_date)`;
    database.query(query, (error, result) => {
        if (error) throw error;
        response.status(200).json({
            "thongke": result
        })
    });
});
//Truyền vào đơn hàng, in ra các sản phẩm trong đơn hàng đó
router.get("/TKgetProductsAdmin", (request, response) => {
    const order_number = request.query.order_number;
    const query = `SELECT Ordering.order_number,
                          DATE_FORMAT(Ordering.order_date, '%d/%m/%Y') AS order_date, 
                          Ordering.status,
                          Ordering.quantity,
                          Product.product_name,
                          Product.price,
                          Product.id,
                          Product.image                        
                   FROM Ordering
                   JOIN Product ON Ordering.product_id = Product.id                              
                   WHERE Ordering.order_number = ?`;
    const args = [order_number];
    database.query(query, args, (error, products) => {
        if (error) throw error;
        response.status(200).json({
            "productsinorder": products
        })
    });
});
//Truyền vào ngày tháng năm trả và một flag để xác định trả về thông tin các sản phẩm đó trong đơn hàng theo ngày nếu flag = 1, trả về thông tin đơn hàng theo ngày nếu flag = 2,..
router.get("/thongkesanphamtheongaythangnam", (request, response) => {
    const day = request.query.day;
    const month = request.query.month;
    const year = request.query.year;
    const flag = request.query.flag;
    if (flag == 1) {
        const query = `SELECT 
        Ordering.order_number,
        Ordering.order_date,
        Ordering.status,
        Ordering.quantity,
        Product.product_name,
        Product.price,
        Product.id,
        Product.image
        FROM
        Ordering
        JOIN Product ON Ordering.product_id = Product.id
        WHERE Ordering.status = 4 AND DAY(Ordering.order_date) = ? AND MONTH(Ordering.order_date) = ? AND YEAR(Ordering.order_date) = ?`;
        const args = [day, month, year];
        database.query(query, args, (error, result) => {
            if (error) throw error;
            response.status(200).json({
                "ListProductOrrder": result
            })
        });
    } else if (flag == 2) {
        const query = `SELECT 
        Ordering.order_number,
        Ordering.order_date,
        Ordering.status,
        Ordering.quantity,
        Product.product_name,
        Product.price,
        Product.id,
        Product.image
        FROM
        Ordering
        JOIN Product ON Ordering.product_id = Product.id
        WHERE Ordering.status = 4  AND MONTH(Ordering.order_date) = ? AND YEAR(Ordering.order_date) = ?`;
        const args = [month, year];
        database.query(query, args, (error, result) => {
            if (error) throw error;
            response.status(200).json({
                "ListProductOrrder": result
            })
        });
    } else if (flag == 3) {
        const query = `SELECT 
        Ordering.order_number,
        Ordering.order_date,
        Ordering.status,
        Ordering.quantity,
        Product.product_name,
        Product.price,
        Product.id,
        Product.image
        FROM
        Ordering
        JOIN Product ON Ordering.product_id = Product.id
        WHERE Ordering.status = 4 AND YEAR(Ordering.order_date) = ?`;
        const args = [year];
        database.query(query, args, (error, result) => {
            if (error) throw error;
            response.status(200).json({
                "ListProductOrrder": result
            })
        });
    }
});
//Truyền vào ngày tháng năm trả và một flag để xác định trả về thông tin các đơn hàng đó theo ngày nếu flag = 1, trả về thông tin đơn hàng theo tháng nếu flag = 2, trả về thông tin đơn hàng theo năm nếu flag = 3, những đơn hàng trùng order_number sẽ in ra 1 lần
router.get("/thongkedonhangtheongaythangnam", (request, response) => {
    const day = request.query.day;
    const month = request.query.month;
    const year = request.query.year;
    const flag = request.query.flag;
    if (flag == 1) {
        const query = `SELECT 
        Ordering.order_number,
        Ordering.order_date,
        Ordering.status,
        Ordering.quantity,
        Product.product_name,
        Product.price,
        Product.id,
        Product.image
        FROM
        Ordering
        JOIN Product ON Ordering.product_id = Product.id
        WHERE Ordering.status = 4 AND DAY(Ordering.order_date) = ? AND MONTH(Ordering.order_date) = ? AND YEAR(Ordering.order_date) = ?`;
        const args = [day, month, year];
        database.query(query, args, (error, result) => {
            if (error) throw error;
            response.status(200).json({
                "orders": result
            })
        });
    } else if (flag == 2) {
        const query = `SELECT 
        Ordering.order_number,
        Ordering.order_date,
        Ordering.status,
        Ordering.quantity,
        Product.product_name,
        Product.price,
        Product.id,
        Product.image
        FROM
        Ordering
        JOIN Product ON Ordering.product_id = Product.id
        WHERE Ordering.status = 4  AND MONTH(Ordering.order_date) = ? AND YEAR(Ordering.order_date) = ?`;
        const args = [month, year];
        database.query(query, args, (error, result) => {
            if (error) throw error;
            response.status(200).json({
                "orders": result
            })
        });
    } else if (flag == 3) {
        const query = `SELECT 
        Ordering.order_number,
        Ordering.order_date,
        Ordering.status,
        Ordering.quantity,
        Product.product_name,
        Product.price,
        Product.id,
        Product.image
        FROM
        Ordering
        JOIN Product ON Ordering.product_id = Product.id
        WHERE Ordering.status = 4 AND YEAR(Ordering.order_date) = ?`;
        const args = [year];
        database.query(query, args, (error, result) => {
            if (error) throw error;
            response.status(200).json({
                "orders": result
            })
        });
    }
});
//Thống kê doanh thu theo tháng
router.get("/thongkedoanhthuthang", (request, response) => {
    const thang = request.query.thang;
    const nam = request.query.nam;
    const query = `SELECT 
    MONTH(Ordering.order_date) AS kq,
    SUM(Product.price * Ordering.quantity) AS price
    FROM
    Ordering
    JOIN Product ON Ordering.product_id = Product.id
    WHERE Ordering.status = 4 AND YEAR(Ordering.order_date)=? AND  MONTH(Ordering.order_date)=?
   `;
    const args = [nam, thang];
    database.query(query, args, (error, result) => {
        if (error) throw error;
        response.status(200).json({
            "thongke": result
        })
    });
});
//Thống kê tổng số đơn hàng theo tháng
router.get("/thongkesodonhangthang", (request, response) => {
    const thang = request.query.thang;
    const nam = request.query.nam;
    const query = `SELECT 
    MONTH(Ordering.order_date) AS kq,
    COUNT(Ordering.order_number) AS price
    FROM
    Ordering
    WHERE  YEAR(Ordering.order_date)=? AND  MONTH(Ordering.order_date)=?
   `;
    const args = [nam, thang];
    database.query(query, args, (error, result) => {
        if (error) throw error;
        response.status(200).json({
            "thongke": result
        })
    });
});
// Thống kê đơn hàng theo status theo tháng 
router.get("/thongkedonhangstatusthang", (request, response) => {
    const status = request.query.status;
    const thang = request.query.thang;
    const nam = request.query.nam;
    const query = `SELECT 
    MONTH(Ordering.order_date) AS kq,
    COUNT(Ordering.order_number) AS price
 
    FROM
    Ordering
    WHERE Ordering.status = ? AND YEAR(Ordering.order_date)=? AND  MONTH(Ordering.order_date)=?
    `;
    const args = [status, nam, thang];
    database.query(query, args, (error, result) => {
        if (error) throw error;
        response.status(200).json({
            "thongke": result
        })
    });
})
//Thống kê doanh thu theo ngày
router.get("/thongkedoanhthungay", (request, response) => {
    const ngay = request.query.ngay
    const thang = request.query.thang;
    const nam = request.query.nam;
    const query = `SELECT 
    DAY(Ordering.order_date) AS kq,
    SUM(Product.price * Ordering.quantity) AS price
    FROM
    Ordering
    JOIN Product ON Ordering.product_id = Product.id
    WHERE Ordering.status = 4 AND YEAR(Ordering.order_date)=? AND  MONTH(Ordering.order_date)=? AND DAY(Ordering.order_date) =?
   `;
    const args = [nam, thang, ngay];
    database.query(query, args, (error, result) => {
        if (error) throw error;
        response.status(200).json({
            "thongke": result
        })
    });
});
//Thống kê tổng số đơn hàng theo ngày
router.get("/thongkesodonhangngay", (request, response) => {
    const ngay = request.query.ngay
    const thang = request.query.thang;
    const nam = request.query.nam;
    const query = `SELECT 
    DAY(Ordering.order_date) AS kq,
    COUNT(Ordering.order_number) AS price
    FROM
    Ordering
    WHERE  YEAR(Ordering.order_date)=? AND  MONTH(Ordering.order_date)=? AND DAY(Ordering.order_date) =?
   `;
    const args = [nam, thang, ngay];
    database.query(query, args, (error, result) => {
        if (error) throw error;
        response.status(200).json({
            "thongke": result
        })
    });

});
// Thống kê đơn hàng theo status theo ngày
router.get("/thongkedonhangstatusngay", (request, response) => {
    const status = request.query.status;
    const ngay = request.query.ngay
    const thang = request.query.thang;
    const nam = request.query.nam;
    const query = `SELECT 
    DAY(Ordering.order_date) AS kq,
    COUNT(Ordering.order_number) AS price
    FROM
    Ordering
    WHERE Ordering.status = ? AND YEAR(Ordering.order_date)=? AND  MONTH(Ordering.order_date)=? AND DAY(Ordering.order_date) =?
    `;
    const args = [status, nam, thang, ngay];
    database.query(query, args, (error, result) => {
        if (error) throw error;
        response.status(200).json({
            "thongke": result
        })
    });
});
//Thống kê doanh thu theo năm
router.get("/thongkedoanhthunam", (request, response) => {

    const nam = request.query.nam;
    const query = `SELECT 
    YEAR(Ordering.order_date) AS kq,
    SUM(Product.price * Ordering.quantity) AS price
    FROM
    Ordering
    JOIN Product ON Ordering.product_id = Product.id
    WHERE Ordering.status = 4 AND YEAR(Ordering.order_date)=? 
   `;
    const args = [nam];
    database.query(query, args, (error, result) => {
        if (error) throw error;
        response.status(200).json({
            "thongke": result
        })
    });
});
//Thống kê tổng số đơn hàng theo năm
router.get("/thongkesodonhangnam", (request, response) => {
    const nam = request.query.nam;
    const query = `SELECT 
    YEAR(Ordering.order_date) AS kq,
    COUNT(Ordering.order_number) AS price
    FROM
    Ordering
    WHERE YEAR(Ordering.order_date)=?
    `;
    const args = [nam];
    database.query(query, args, (error, result) => {
        if (error) throw error;
        response.status(200).json({
            "thongke": result
        })
    });
});
// Thống kê đơn hàng theo status theo năm
router.get("/thongkedonhangstatusnam", (request, response) => {
    const status = request.query.status;
    const nam = request.query.nam;
    const query = `SELECT 
    YEAR(Ordering.order_date) AS kq,
    COUNT(Ordering.order_number) AS price
    FROM
    Ordering
    WHERE Ordering.status = ? AND YEAR(Ordering.order_date)=?
    `;
    const args = [status, nam];
    database.query(query, args, (error, result) => {
        if (error) throw error;
        response.status(200).json({
            "thongke": result
        })
    });
})
//Thống kê 10 người dùng mua hàng nhiều nhất
router.get("/thongkenguoidung", (request, response) => {
        const query = `SELECT 
    User.id,
    User.name,
    User.email,
    COUNT(Ordering.user_id) AS sl
    FROM
    Ordering
    JOIN User ON Ordering.user_id = User.id
    WHERE Ordering.status = 4
    GROUP BY Ordering.user_id
    ORDER BY COUNT(Ordering.user_id) DESC
    LIMIT 10`;
        database.query(query, (error, result) => {
            if (error) throw error;
            response.status(200).json({
                "thongke": result
            })
        });
    })
    //10 người hay có lượng ủy đơn lớn
router.get("/thongkenguoidunghuydon", (request, response) => {
    const query = `SELECT 
    User.id,
    User.name,
    User.email,
    COUNT(Ordering.user_id) AS sl
    FROM
    Ordering
    JOIN User ON Ordering.user_id = User.id
    WHERE Ordering.status = 0
    GROUP BY Ordering.user_id
    ORDER BY COUNT(Ordering.user_id) DESC
    LIMIT 10`;
    database.query(query, (error, result) => {
        if (error) throw error;
        response.status(200).json({
            "thongke": result
        })
    });
})

module.exports = router