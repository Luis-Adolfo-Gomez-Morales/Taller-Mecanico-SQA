const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validarCliente, campos } = require('../src/scripts/cliente-validation');
const completo = { tipoPersona: 'Individual', nombre: 'Ana Perez', dpi: '1234567890101',
    telefono: '5555-1234', correo: 'ana@example.com', licencia: 'A-12345', tipoLicencia: 'A',
    venceLicencia: '2030-12-31', direccion: 'Direccion completa',
    contactoEmpresa: 'Ana Perez', vehiculo: 'P-123ABC', estado: 'Activo' };
test('Cada campo debe estar presente, con contenido real y dentro del largo de su columna', () => {
    for (const [key, , max] of campos) {
        for (const value of [undefined, null, '', '   ', '\t\n']) assert.throws(() => validarCliente({ ...completo, [key]: value }), /Completa/);
        assert.throws(() => validarCliente({ ...completo, [key]: 'x'.repeat(max + 1) }), /maximo/);
    }
});
test('Se rechazan correo, estados, fechas imposibles y asignaciones pendientes', () => {
    for (const cambio of [{ correo: 'sin-correo' }, { tipoPersona: 'Otro' },
        { venceLicencia: '2026-02-30' }, { venceLicencia: '0000-00-00' }]) {
        assert.throws(() => validarCliente({ ...completo, ...cambio }));
    }
});
test('Individual y Empresa requieren todos sus datos y se normalizan espacios', () => {
    for (const tipoPersona of ['Individual', 'Empresa']) {
        const value = validarCliente({ ...completo, tipoPersona, nombre: ' Ana Perez ', vehiculo: 'p-123abc' });
        assert.equal(value.nombre, 'Ana Perez'); assert.equal(value.vehiculo, undefined);
        assert.equal(Object.keys(value).length, 10);
        assert.equal(value.estado, undefined);
    }
});

test('Contacto empresa opcional se normaliza a null y estado no se acepta del formulario', () => {
    for (const contactoEmpresa of [undefined, null, '', '   ']) {
        const cliente = validarCliente({ ...completo, contactoEmpresa, estado: 'Inactivo' });
        assert.equal(cliente.contactoEmpresa, null);
        assert.equal(cliente.estado, undefined);
    }
    assert.throws(() => validarCliente({ ...completo, contactoEmpresa: 'x'.repeat(151) }), /maximo/);
    assert.throws(() => validarCliente({ ...completo, contactoEmpresa: 123 }), /texto/);
});

test('Un propietario se registra sin vehiculo y no acepta una placa como relacion', () => {
    const datos = { ...completo };
        delete datos.vehiculo;
    assert.doesNotThrow(() => validarCliente(datos));
    assert.equal(validarCliente(completo).vehiculo, undefined);
});
