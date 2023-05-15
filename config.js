const mysql = require('mysql');

const connectionPool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'katchi',
})

module.exports = connectionPool;

// const mongoose = require('mongoose');
// mongoose.connect('mongodb+srv://vohongkhang202:Khang2002@cluster0.usvkdgf.mongodb.net/Api-ecom?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// module.exports = { mongoose };

//https://console.clever-cloud.com/users/me/addons/addon_3c167a87-ec43-4bc3-b6ee-f2847ac69a85
// const mysql = require('mysql');

// const connectionPool = mysql.createPool({
//     connectionLimit: 10,
//     host: 'bga2el6jz6cnph4y6jbj-mysql.services.clever-cloud.com',
//     user: 'unme5hffknteobkj',
//     password: 'd4t6jAVLwKWIGsmm2TJ1',
//     database: 'bga2el6jz6cnph4y6jbj',
//     queueLimit: 0
//  });

module.exports = connectionPool;
// =======
//     host: 'btzfghji8c4n84oyb1va-mysql.services.clever-cloud.com',
//     user: 'uagudj4doikmrp1o',
//     password: 'bPuel4XijUujYaEe9SzX',
//     database: 'btzfghji8c4n84oyb1va',
//     queueLimit: 0
//  })

// module.exports = connectionPool;
// >>>>>>> d4110b46e6e4a130fcd9c52c277d6e1c13005a30
