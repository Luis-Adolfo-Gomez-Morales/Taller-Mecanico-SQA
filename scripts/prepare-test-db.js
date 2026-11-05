const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
const config = require('../src/config');

async function preparar() {
    // Solo se permite preparar una base de pruebas, nunca la base del taller.
    if (!/^[a-zA-Z0-9_]+_sqa_test$/.test(config.database)) throw new Error('DB_NAME debe terminar en _sqa_test.');
    const connection = await mysql.createConnection({ ...config, database: undefined });
    try {
        await connection.query('CREATE DATABASE IF NOT EXISTS ' + connection.escapeId(config.database));
        await connection.changeUser({ database: config.database });
        const [tables] = await connection.query('SHOW TABLES');
        if (tables.length) throw new Error('La base de pruebas debe estar vacia. No se borraron tablas.');
        const schema = fs.readFileSync(path.join(__dirname, '../tests/fixtures/schema.sql'), 'utf8');
        for (const statement of schema.split(';').filter(value => value.trim())) await connection.query(statement);
        await connection.execute("INSERT INTO usuarios (usuario, password_hash, nombre, estado) VALUES (?, ?, ?, 'Activo')", ['usuario_sqa', 'clave-solo-de-prueba', 'Usuario de prueba']);
        await connection.query("INSERT INTO tipos_trabajo (id_tipo_trabajo, nombre) VALUES (1, 'Mec?nico'), (2, 'El?ctrico'), (3, 'Enderezado y Pintura'), (4, 'Pinchazo')");
        await connection.query("INSERT INTO tipos_vehiculo (tipo) VALUES ('Camion'), ('Sedan')");
        await connection.query("INSERT INTO servicios (nombre, tipo, intervalo_dias_normal, intervalo_km_referencial, estado) VALUES ('Revision de ejemplo', 'Preventivo', 90, 5000, 'Activo')");
        console.log('Base de pruebas preparada sin datos del taller.');
    } finally { await connection.end(); }
}
preparar().catch(error => { console.error(error.message); process.exitCode = 1; });
