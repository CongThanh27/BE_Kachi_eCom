const mysql = require('mysql');

const connectionPool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'souq',
})

module.exports = connectionPool;

// const mongoose = require('mongoose');
// mongoose.connect('mongodb+srv://vohongkhang202:Khang2002@cluster0.usvkdgf.mongodb.net/Api-ecom?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// module.exports = { mongoose };
