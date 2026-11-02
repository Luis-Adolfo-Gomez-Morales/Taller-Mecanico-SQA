
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createRules } = require('../src/maintenance-rules');

test('Rechaza kilometraje menor al registrado sin modificar MySQL', async () => {
  const operaciones = [];

  const connection = {
    beginTransaction: async () => {
      operaciones.push('BEGIN');
    },
    execute: async (sql) => {
      operaciones.push(sql);

      if (sql.includes('FROM vehiculos')) {
        return [[{
          id_vehiculo: 1,
          kilometraje: 5000
        }]];
      }

      if (sql.includes('FROM historial_kilometraje')) {
        return [[{
          ultimo: 5000
        }]];
      }
      return [[]];
    },
    commit: async () => {
      operaciones.push('COMMIT');
    },
    rollback: async () => {
      operaciones.push('ROLLBACK');
    },
    release: () => {
      operaciones.push('RELEASE');
    }
  };

  const pool = {
    getConnection: async () => connection
  };

  const rules = createRules(pool);

  await assert.rejects(
    rules.actualizarKilometraje(1, 4000),
    /kilometraje no puede ser menor/
  );

  assert.ok(operaciones.includes('BEGIN'));
  assert.ok(operaciones.includes('ROLLBACK'));
  assert.ok(operaciones.includes('RELEASE'));

  assert.ok(!operaciones.includes('COMMIT'));

  assert.ok(
    !operaciones.some(sql =>
      sql.startsWith('UPDATE') || sql.startsWith('INSERT')
    )
  );
});



test('Actualiza kilometraje y registra historial correctamente', async () => {
  const operaciones = [];

  const connection = {
    beginTransaction: async () => {
      operaciones.push({ tipo: 'BEGIN' });
    },

    execute: async (sql, params = []) => {
      operaciones.push({ tipo: 'SQL', sql, params });

      if (sql.includes('FROM vehiculos')) {
        return [[{
          id_vehiculo: 1,
          kilometraje: 5000
        }]];
      }

      if (sql.includes('FROM historial_kilometraje')) {
        return [[{ ultimo: 5000 }]];
      }

      return [{ affectedRows: 1 }];
    },

    commit: async () => {
      operaciones.push({ tipo: 'COMMIT' });
    },

    rollback: async () => {
      operaciones.push({ tipo: 'ROLLBACK' });
    },

    release: () => {
      operaciones.push({ tipo: 'RELEASE' });
    }
  };

  const pool = {
    getConnection: async () => connection
  };

  const rules = createRules(pool);

  const resultado = await rules.actualizarKilometraje(1, 6000);

  assert.equal(resultado.kilometraje, 6000);

  assert.ok(
    operaciones.some(op =>
      op.tipo === 'SQL' &&
      op.sql.includes('INSERT INTO historial_kilometraje') &&
      op.params.includes(6000)
    )
  );

  assert.ok(
    operaciones.some(op =>
      op.tipo === 'SQL' &&
      op.sql.includes('UPDATE vehiculos') &&
      op.params.includes(6000)
    )
  );

  assert.ok(operaciones.some(op => op.tipo === 'COMMIT'));
  assert.ok(operaciones.some(op => op.tipo === 'RELEASE'));
  assert.ok(!operaciones.some(op => op.tipo === 'ROLLBACK'));
});

test('Ejecuta rollback cuando falla MySQL', async () => {
  const operaciones = [];

  const connection = {
    beginTransaction: async () => {
      operaciones.push('BEGIN');
    },

    execute: async (sql) => {
      if (sql.includes('FROM vehiculos')) {
        return [[{
          id_vehiculo: 1,
          kilometraje: 5000
        }]];
      }

      if (sql.includes('FROM historial_kilometraje')) {
        return [[{ ultimo: 5000 }]];
      }

      if (sql.includes('INSERT INTO historial_kilometraje')) {
        operaciones.push('INSERT');
        throw new Error('Error simulado de MySQL');
      }

      operaciones.push('SQL');
      return [{ affectedRows: 1 }];
    },

    commit: async () => {
      operaciones.push('COMMIT');
    },

    rollback: async () => {
      operaciones.push('ROLLBACK');
    },

    release: () => {
      operaciones.push('RELEASE');
    }
  };

  const pool = {
    getConnection: async () => connection
  };

  const rules = createRules(pool);

  await assert.rejects(
    rules.actualizarKilometraje(1, 6000),
    /Error simulado de MySQL/
  );

  assert.ok(operaciones.includes('BEGIN'));
  assert.ok(operaciones.includes('INSERT'));
  assert.ok(operaciones.includes('ROLLBACK'));
  assert.ok(operaciones.includes('RELEASE'));
  assert.ok(!operaciones.includes('COMMIT'));

  assert.ok(
    operaciones.indexOf('ROLLBACK') <
    operaciones.indexOf('RELEASE')
  );
});