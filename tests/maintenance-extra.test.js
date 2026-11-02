
const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  kilometrajeValido,
  proximaFecha
} = require('../src/maintenance-rules');

// PRUEBAS DE KILOMETRAJE

test('Acepta un kilometraje válido', () => {
  assert.equal(kilometrajeValido(1500), 1500);
});

test('Acepta kilometraje cero', () => {
  assert.equal(kilometrajeValido(0), 0);
});

test('Redondea kilometraje a dos decimales', () => {
  assert.equal(kilometrajeValido(1500.256), 1500.26);
});

test('Rechaza kilometraje negativo', () => {
  assert.throws(() => kilometrajeValido(-10));
});

test('Rechaza kilometraje vacío', () => {
  assert.throws(() => kilometrajeValido(''));
});

test('Rechaza kilometraje no numérico', () => {
  assert.throws(() => kilometrajeValido('abc'));
});

test('Rechaza kilometraje infinito', () => {
  assert.throws(() => kilometrajeValido(Infinity));
});

// PRUEBAS DE FECHAS DE MANTENIMIENTO

test('Calcula próxima fecha con uso normal', () => {
  assert.equal(
    proximaFecha('2026-01-01', 100, 'Normal'),
    '2026-04-11'
  );
});

test('Calcula próxima fecha con uso bajo', () => {
  assert.equal(
    proximaFecha('2026-01-01', 100, 'Bajo'),
    '2026-05-06'
  );
});

test('Calcula próxima fecha con uso alto', () => {
  assert.equal(
    proximaFecha('2026-01-01', 100, 'Alto'),
    '2026-03-17'
  );
});

test('Rechaza nivel de uso inválido', () => {
  assert.throws(() =>
    proximaFecha('2026-01-01', 100, 'Extremo')
  );
});

test('Rechaza fecha inválida', () => {
  assert.throws(() =>
    proximaFecha('fecha-invalida', 100, 'Normal')
  );
});

test('No calcula fecha cuando días es cero', () => {
  assert.equal(
    proximaFecha('2026-01-01', 0, 'Normal'),
    null
  );
});
