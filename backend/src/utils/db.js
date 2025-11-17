const mysql = require('mysql2/promise'); // Importa o driver

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'BorsattoRitter19',
    database: process.env.DB_NAME || 'login_jwt',
    waitForConnections: true,
    connectionLimit: 10,
});

module.exports = pool;