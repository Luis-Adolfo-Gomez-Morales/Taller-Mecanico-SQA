const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
test('El creador procede de la sesion de la ventana, no del formulario', async () => {
    const handlers = new Map();
    const calls = [];
    const database = {
        authenticateUser: async (user, password) => password === 'valida' ? { id: 7, usuario: user } : null,
        createVehiculo: async (data, id) => { calls.push({ data, id }); }
    };
    const electron = { app: { whenReady: () => ({ then() {} }), on() {} }, ipcMain: { handle: (channel, fn) => handlers.set(channel, fn) } };
    const ctx = vm.createContext({ require: name => name === 'electron' ? electron : name === 'path' ? path : database });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8'), ctx);
    vm.runInContext('registerDatabaseHandlers()', ctx);
    const event = { sender: {} };
    await handlers.get('auth:login')(event, 'prueba', 'valida');
    await handlers.get('vehiculos:create')(event, { creadoPor: 999 });
    assert.equal(calls.pop().id, 7);
    await handlers.get('vehiculos:create')({ sender: {} }, { creadoPor: 7 });
    assert.equal(calls.pop().id, undefined);
    await handlers.get('auth:login')(event, 'prueba', 'incorrecta');
    await handlers.get('vehiculos:create')(event, {});
    assert.equal(calls.pop().id, undefined);
});
