const express = require('express')
const router = express.Router()
// For Token
const jwt = require('jsonwebtoken')
// For encrypted password
const bcrypt = require('bcrypt');
const checkAuth = require('../../middleware/check_auth');
// Deal with file
const fileSystem = require('fs');
// Upload and store images
const multer = require('multer')
// Send mail
const mail_util = require('../../utils/mail');
const storage = multer.diskStorage({
    // Place of picture
    destination: (request, file, callback) => {
        callback(null, 'storage_user/');
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

// Get All users
router.get("/", (request, response) => {
    var page = request.query.page;
    var page_size = request.query.page_size;
    console.log(typeof page);
    if(page == null){
        page = 0;
     }
     if(page_size == null){
        page_size = 25;
     }
     const args = [
        parseInt(page_size),
        parseInt(page)
    ];
    const query = "SELECT * FROM user LIMIT ? OFFSET ?"
    database.query(query, args, (error, result) => {
        if(error) throw error;
        response.status(200).json({
            "error" : false,
            "users" : result
        })

    })
});

// // Login
// router.get("/login", (request, response) => {
//     const email = request.query.email
//     const password = request.query.password
//     const query = "SELECT id, password, name, email, if(isAdmin=1,  'true', 'false') as isAdmin FROM user WHERE email = ?";
//     const args = [email]
//     database.query(query, args, (error, result) => {
//         if(error) throw error
//         if(result.length == 1){
//             const dataPassword = result[0]['password'];
//             // Compare two passwords
//             bcrypt.compare(password, dataPassword, (err, isSame) => {
//                 if(isSame){
//                     // Return Token
//                     jwt.sign(email, process.env.JWT_KEY, (err, token) => {
//                         if (err) throw err;
//                         response.status(200).json({
//                            "id" : result[0]["id"],
//                            "name" : result[0]["name"],
//                            "email" : result[0]["email"],
//                            "isAdmin" : result[0]["isAdmin"],
//                            "error" : false, 
//                            "message" : "Successful Login",
//                            "password": password,
//                            "token" : token});
//                     });
//                 }else{
//                     response.status(500).send("Invalid Password")
//                 }
//             });
//         }else{
//             response.status(214).json({
//                 "error" : true, 
//                 "message" : "Account does not exist"});
//         }
//     });
// });
router.get("/login", (request, response) => {
    const email = request.query.email;
    const password = request.query.password;
    const query = "SELECT id, password, name, email, if(isAdmin=1,  'true', 'false') as isAdmin, address, gender, age, phone_number FROM user WHERE email = ? and password = ?";
    const args = [email,password];
    database.query(query, args, (error, result) => {
        if(error) throw error;
        if(result.length == 1){
            response.status(200).json({
                "id" : result[0]["id"],
                "name" : result[0]["name"],
                "email" : result[0]["email"],
                "isAdmin" : result[0]["isAdmin"],
                "address" : result[0]["address"],
                "gender" : result[0]["gender"],
                "age" : result[0]["age"],
                "phone_number" : result[0]["phone_number"],
                "error" : false, 
                "message" : "Successful Login"
            });
        }else{
            response.status(214).json({
                "error" : true, 
                "message" : "Account does not exist"
            });
        }
    });
});

router.post("/register",uploadImage.single('image'), (request, response) => {
    const name = request.body.name
    const email = request.body.email
    const password = request.body.password
    var gender = request.body.gender
    var age = request.body.age

    const checkQuery = "SELECT id FROM user WHERE email = ?"
    database.query(checkQuery, email , (error, result)  => {
        if(error) throw error;
        if(result.length != 0){
            response.status(217).json({
                "error" : true,
                "message" : "User Already Registered"
            })
        }else{

            // Register new user
            if(typeof gender == 'undefined' && gender == null){
                gender = "undertermined";
            }
        
            if(typeof age == 'undefined' && age == null){
                age = 0;
            }
        
            const file = request.file;
            var filePath = ""
            if(file != null){
                filePath = file.path
            }
        
            if(password.length < 8){
                response.status(500).send("Invalid Password")
            }
                
            const query = "INSERT INTO user(name, email, password, gender, age, image) VALUES(?, ?, ?, ?, ?,?)"
        
            const args = [name, email, password, gender, age, filePath]
        
            database.query(query, args, (error, result) => {
                if (error) throw error
                
                const userQuery = "SELECT id, name, email, password, if(isAdmin=1,  'true', 'false') as isAdmin FROM user WHERE id = ?";
                database.query(userQuery, result.insertId, (err, res) => {
                    if (error) throw error
                    response.status(200).json({
                        "error" : false,
                        "message" : "Register Done",
                        "user" : res[0],
                    })
                })
            });
        }
    });
});
// Insert User
// router.post("/register",uploadImage.single('image'), (request, response) => {
//     const name = request.body.name
//     const email = request.body.email
//     const password = request.body.password
//     var gender = request.body.gender
//     var age = request.body.age

//     const checkQuery = "SELECT id FROM user WHERE email = ?"
//     database.query(checkQuery, email , (error, result)  => {
//         if(error) throw error;
//         if(result.length != 0){
//             response.status(217).json({
//                 "error" : true,
//                 "message" : "User Already Registered"
//             })
//         }else{

//             // Register new user
//             if(typeof gender == 'undefined' && gender == null){
//                 gender = "undertermined";
//             }
        
//             if(typeof age == 'undefined' && age == null){
//                 age = 0;
//             }
        
//             const file = request.file;
//             var filePath = ""
//             if(file != null){
//                 filePath = file.path
//             }
        
//             if(password.length < 8){
//                 response.status(500).send("Invalid Password")
//             }
                
//             const query = "INSERT INTO user(name, email, password, gender, age, image) VALUES(?, ?, ?, ?, ?,?)"
                
//             // Encrypt Password
//             bcrypt.hash(password, 10, (error, hashedPassword) => {
//                 if(error) throw error
        
//                 const args = [name, email, hashedPassword, gender, age, filePath]
        
//                 database.query(query, args, (error, result) => {
//                     if (error) throw error
//                     /*
//                     response.status(200).json({
//                         "id" : result.insertId,
//                         "error" : false,
//                         "message" : "Register Done"
//                     })
//                     */
//                    const userQuery = "SELECT id, name, email, password, if(isAdmin=1,  'true', 'false') as isAdmin FROM user WHERE id = ?";
//                    database.query(userQuery, result.insertId, (err, res) => {
//                        if (error) throw error
//                        response.status(200).json({
//                            "error" : false,
//                            "message" : "Register Done",
//                            "user" : res[0],
//                        })
//                    })
//                 });
//             });
//         }
//     });
// });
    
// Delete User
router.delete("/:id", checkAuth, (request, response) => {
    const id = request.params.id;
    const query = "DELETE FROM user WHERE id = ?"
    const args = [id]

    database.query(query, args, (error, result) => {
        if(error) throw error
        response.status(200).send("Account is deleted")
    });
});
 
// Update Password
// bỏ phần checkAuth,
router.put("/info",  (request, response) => {
    const id = request.query.id;
    const password = request.query.password;

    const query = "UPDATE user SET password = ? WHERE id = ?";
    const args = [password, id];

    database.query(query, args, (error, result) => {
        if (error) {
            throw error;
        } else if (result['affectedRows'] == 1) {
            response.status(200).send("Password is updated");
        } else {
            response.status(500).send("Invalid Update");
        }
    });
});

// Update image of user                 
router.put("/upload", checkAuth, uploadImage.single('image'), (request, response) => {
    const id = request.body.id;
    console.log(id);

    const file = request.file;
    var filePath = ""
    if(file != null){
        filePath = file.path
    }
    console.log(filePath);

    const selectQuery = "SELECT image FROM user WHERE id = ?"
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

    const query = "UPDATE user SET image = ? WHERE id = ?"  
    
    const args = [filePath,id]

    database.query(query, args, (error, result) => {
        if(error) throw error

        if(result['affectedRows']  == 1){
            response.status(200).send("User Photo is updated")
        }else{
            response.status(500).send("Invalid Update")
        }
    });

});


// Get Image
router.get("/getImage", (request, response) => {
    const id = request.query.id;
   
    const args = [id];

    const query = "SELECT image FROM user WHERE id = ?";

    database.query(query, args, (error, result) => {
        if(error) throw error
        response.status(200).json({
            "error" : false,
            "message" : "Setting Image",
            "image" : result[0]["image"],
        })
    });
}); 


// Get OTP

router.get("/otp", (request, response) => {
    const email = request.query.email

    const args = [email];

    const query = "SELECT email FROM user WHERE email = ?"
    database.query(query, args, (error, result) => {
        // Error in database
        if(error) throw error;

        // if email is correct
        if(result.length == 1) {

            const otp = mail_util.getRandomInt(100000, 999999)
            mail_util.sendOptMail(email, otp);
           
            response.status(200).json({
                "error" : false,
                "otp": otp,
                "email": email
            });

        } else{
            response.status(500).json({"error" : true,"message": "Incorrect Email"});
        }
    })
});

//lấy thông tin user truyền vào id
router.get("/thongtindathang", (request, response) => {
    const id = request.query.id;  
    const query = "SELECT * from user WHERE id = ?"    
        const args = [id]
        database.query(query, args, (error, result) => {
            if(error) throw error
            response.status(200).json({
                "user" : result[0],
            })
        });

});
// Cập nhật user
router.put("/adupdate", uploadImage.single('image'), (request, response) => {
    const id = request.body.id;
    const { 
        name, 
        email, 
        password, 
        gender, 
        age, 
        isAdmin,
    } = request.body;
    const file = request.file;
    var filePath = ""
    if (file != null) {
        filePath = file.path
    }
    // Lấy thông tin user hiện có trong database
    const selectQuery = "SELECT * FROM user WHERE id = ?";
    database.query(selectQuery, id, (error, result) => {
        if (error) throw error;
        // Lấy giá trị của các thuộc tính hiện tại
        const {
            name: currentName,
            email: currentEmail,
            password: currentPassword,
            gender: currentGender,
            age: currentAge,
            image: currentImage,
            isAdmin: currentIsAdmin,
        } = result[0];
        // Sử dụng giá trị từ database nếu các thuộc tính bị thiếu
        const updatedName = name || currentName;
        const updatedEmail = email || currentEmail;
        const updatedPassword = password || currentPassword;
        const updatedGender = gender || currentGender;
        const updatedAge = age || currentAge;
        const updatedIsAdmin = isAdmin || currentIsAdmin;
        const selectQuery = "SELECT image FROM user WHERE id = ?"
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
        const query = "UPDATE user SET name = ?, email = ?, password = ?, gender = ?, age = ?, image = ?, isAdmin = ? WHERE id = ?";
        const args = [
            updatedName,
            updatedEmail,
            updatedPassword,
            updatedGender,
            updatedAge,
            filePath || currentImage,
            updatedIsAdmin,
            id
        ];
        database.query(query, args, (error, result) => {
            if (error) throw error
            if (result['affectedRows'] == 1) {
                response.status(200).send("User information is updated")
            } else {
                response.status(500).send("Invalid Update")
            }
        });
    });
});


router.put("/capnhatdiachi", (request, response) => {
    const id = request.query.id;
    const address = request.query.address;
    const phone_number = request.query.phone_number;
    const query = `UPDATE user SET address = ?, phone_number = ? WHERE id = ?`;
    const args = [address, phone_number, id];
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

module.exports = router