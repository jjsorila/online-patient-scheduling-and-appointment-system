const mysql = require('mysql');

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'my_scheduler',
    multipleStatements: true
})

module.exports = db