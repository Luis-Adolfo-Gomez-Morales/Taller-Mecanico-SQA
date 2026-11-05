const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDatabase } = require('../src/database');

test('Cada instancia consulta la conexion recibida sin compartir datos', async () => {
    const rowsA = [{ id_mecanico: 1, nombre: 'Ana' }];
    const rowsB = [{ id_mecanico: 2, nombre: 'Luis' }];
    const consultas = [];
    const conexion = rows => ({ query: async sql => { consultas.push(sql); return [rows]; } });
    const dbA = createDatabase(conexion(rowsA));
    const dbB = createDatabase(conexion(rowsB));
    assert.deepEqual(await dbA.listMecanicos(), rowsA);
    assert.deepEqual(await dbB.listMecanicos(), rowsB);
    assert.equal(consultas.length, 2);
    assert(consultas.every(sql => sql.includes('FROM mecanicos')));
});
