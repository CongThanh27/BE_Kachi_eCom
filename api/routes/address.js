const express = require('express')
const router = express.Router()

// import file
const database = require("../../config")


// Add Address
router.post("/add", (request, response) => {
    const address = request.body.address
    const city = request.body.city
    const country = request.body.country
    const zip = request.body.zip
    const phone = request.body.phone
    const userId = request.body.userId
    const productId = request.body.productId


    const query = "INSERT INTO Shipping(address, city ,country, zip,phone,user_id, product_id) VALUES(?,?,?,?,?,?,?)"

    const args = [address, city, country, zip, phone, userId, productId]

    database.query(query, args, (error, result) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                response.status(500).send("Deplicate Entry")
            } else {
                throw error;
            }
        } else {
            response.status(200).send("Your address is added")
        }
    });
});
router.get("/getShippingInfo", (request, response) => {
    var userId = request.query.userId;

    const query = `
        SELECT DISTINCT address, phone
        FROM Shipping
        WHERE user_id = ?
        
    `;
    const args = [userId];
    database.query(query, args, (error, results) => {
        if (error) throw error;
        response.status(200).json({
            "error": false,
            "shippingInfo": results
        });
    });
});


module.exports = router