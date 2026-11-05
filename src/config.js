const fs = require('node:fs');
const path = require('node:path');

// La configuracion personal es opcional. En GitHub se usan variables de entorno.
const localPath = path.join(__dirname, 'db-config.js');
const local = fs.existsSync(localPath) ? require('./db-config') : require('./db-config.example');
module.exports = {
    host: process.env.DB_HOST || local.host,
    port: Number(process.env.DB_PORT || local.port),
    user: process.env.DB_USER || local.user,
    password: process.env.DB_PASSWORD ?? local.password,
    database: process.env.DB_NAME || local.database
};
