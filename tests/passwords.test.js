const { test } = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword } = require('../src/passwords');
const { createDatabase } = require('../src/database');

test('Las claves se guardan con sal aleatoria y aceptan solo la clave correcta', async () => {
    const first = await hashPassword('Clave de prueba 123');
    const second = await hashPassword('Clave de prueba 123');
    assert.notEqual(first, second);
    assert(first.length <= 255);
    assert(!first.includes('Clave de prueba 123'));
    assert(await verifyPassword('Clave de prueba 123', first));
    assert(!await verifyPassword('Otra clave', first));
});

test('Los datos incompletos y formatos de hash no permitidos se rechazan', async () => {
    for (const stored of [null, undefined, '', 'scrypt$sin-datos', 'scrypt$99999999$8$3$sal$clave', 'scrypt$32768$8$3$sal$clave']) {
        assert.equal(await verifyPassword('prueba', stored), false);
    }
    for (const password of ['', null, 'a'.repeat(1025), 'á'.repeat(513)]) {
        await assert.rejects(hashPassword(password));
        assert.equal(await verifyPassword(password, 'prueba'), false);
    }
});

function conexion(user, affectedRows = 1) {
    const updates = [];
    const db = createDatabase({ execute: async (sql, values) => {
        if (sql.includes('SELECT')) return [[user].filter(Boolean)];
        updates.push({ sql, values });
        return [{ affectedRows }];
    } });
    return { db, updates };
}

test('Una cuenta antigua conserva su clave y se actualiza al iniciar sesion correctamente', async () => {
    const { db, updates } = conexion({ id_usuario: 7, usuario: 'prueba', nombre: 'Usuario', password_hash: 'anterior' });
    assert.deepEqual(await db.authenticateUser('prueba', 'anterior'), { id: 7, usuario: 'prueba', nombre: 'Usuario' });
    assert.equal(updates.length, 1);
    assert(updates[0].sql.includes('BINARY password_hash'));
    assert(updates[0].values[0].startsWith('scrypt$'));
    assert(await verifyPassword('anterior', updates[0].values[0]));
});

test('Una clave incorrecta no cambia la cuenta anterior', async () => {
    const { db, updates } = conexion({ id_usuario: 7, password_hash: 'anterior' });
    assert.equal(await db.authenticateUser('prueba', 'incorrecta'), null);
    assert.deepEqual(updates, []);
});

test('Un hash valido no se vuelve a generar ni se devuelve a la pantalla', async () => {
    const hash = await hashPassword('prueba');
    const { db, updates } = conexion({ id_usuario: 7, usuario: 'prueba', nombre: 'Usuario', password_hash: hash });
    const user = await db.authenticateUser('prueba', 'prueba');
    assert.equal(user.id, 7);
    assert.equal(user.password_hash, undefined);
    assert(!updates[0].sql.includes('SET password_hash'));
});

test('Un cambio simultaneo de clave no se sobrescribe al actualizar una cuenta antigua', async () => {
    const { db } = conexion({ id_usuario: 7, password_hash: 'anterior' }, 0);
    assert.equal(await db.authenticateUser('prueba', 'anterior'), null);
});

test('Un usuario que no existe o una entrada vacia no permite iniciar sesion', async () => {
    const { db, updates } = conexion(null);
    assert.equal(await db.authenticateUser('inexistente', 'prueba'), null);
    assert.equal(await db.authenticateUser('', 'prueba'), null);
    assert.equal(await db.authenticateUser('prueba', ''), null);
    assert.deepEqual(updates, []);
});
