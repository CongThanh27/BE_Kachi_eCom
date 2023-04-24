// const mysql = require('mysql');

// const connectionPool = mysql.createPool({
//     connectionLimit: 10,
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'souq',
// })

// module.exports = connectionPool;

// const mongoose = require('mongoose');
// mongoose.connect('mongodb+srv://vohongkhang202:Khang2002@cluster0.usvkdgf.mongodb.net/Api-ecom?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// module.exports = { mongoose };
const mysql = require('mysql2')

const pool = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USERNAME, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, conn) => {
    if(err) console.log(err)
    console.log("Connected successfully")
})

module.exports = pool.promise()
