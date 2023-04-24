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


const mysql = require('mysql');

const connectionPool = mysql.createPool({
    connectionLimit: 10,
    host: 'bga2el6jz6cnph4y6jbj-mysql.services.clever-cloud.com',
    user: 'unme5hffknteobkj',
    password: 'd4t6jAVLwKWIGsmm2TJ1',
    database: 'bga2el6jz6cnph4y6jbj',
    queueLimit: 0
 });

module.exports = connectionPool;