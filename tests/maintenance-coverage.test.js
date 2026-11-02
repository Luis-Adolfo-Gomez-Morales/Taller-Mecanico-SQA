
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createRules } = require('../src/maintenance-rules');

function crearMock(responder) {
  const operaciones = [];

  const connection = {
    beginTransaction: async () => operaciones.push('BEGIN'),
    execute: async (sql, params = []) => {
      operaciones.push({ sql, params });
      return responder(sql, params);
    },
    commit: async () => operaciones.push('COMMIT'),
    rollback: async () => operaciones.push('ROLLBACK'),
    release: () => operaciones.push('RELEASE')
  };

  const pool = {
    getConnection: async () => connection,
    query: async (sql) => {
      operaciones.push({ sql });
      return responder(sql, []);
    }
  };

  return { rules: createRules(pool), operaciones };
}

test('Cobertura: rechaza vehiculo sin cliente', async () => {
  const { rules, operaciones } = crearMock(async () => [[]]);

  await assert.rejects(
    rules.guardarVehiculo(null, {
      kilometraje: 1000,
      propietario: 'Cliente prueba'
    }, async () => ({ id: 1 })),
    /Registra primero el cliente/
  );

  assert.ok(operaciones.includes('ROLLBACK'));
});

test('Cobertura: rechaza propietario vacio', async () => {
  const { rules } = crearMock(async sql => {
    if (sql.includes('FROM clientes')) {
      return [[{ id_cliente: 1, nombre: 'Juan' }]];
    }
    return [[]];
  });

  await assert.rejects(
    rules.guardarVehiculo(null, {
      idCliente: 1,
      kilometraje: 1000,
      propietario: ' '
    }, async () => ({ id: 1 })),
    /Indica el propietario/
  );
});

test('Cobertura: rechaza cliente inexistente', async () => {
  const { rules } = crearMock(async () => [[]]);

  await assert.rejects(
    rules.guardarVehiculo(null, {
      idCliente: 99,
      kilometraje: 1000,
      propietario: 'Juan'
    }, async () => ({ id: 1 })),
    /cliente vinculado no existe/
  );
});

test('Cobertura: rechaza nivel de uso invalido', async () => {
  const { rules } = crearMock(async sql => {
    if (sql.includes('FROM clientes')) {
      return [[{ id_cliente: 1, nombre: 'Juan' }]];
    }
    return [[]];
  });

  await assert.rejects(
    rules.guardarVehiculo(null, {
      idCliente: 1,
      kilometraje: 1000,
      propietario: 'Juan',
      nivelUso: 'Desconocido'
    }, async () => ({ id: 1 })),
    /Nivel de uso invalido/
  );
});

test('Cobertura: registra vehiculo e historial', async () => {
  const { rules, operaciones } = crearMock(async sql => {
    if (sql.includes('FROM clientes')) {
      return [[{ id_cliente: 1, nombre: 'Juan' }]];
    }
    return [{ affectedRows: 1 }];
  });

  const resultado = await rules.guardarVehiculo(null, {
    idCliente: 1,
    kilometraje: 2500,
    propietario: ' Juan ',
    nivelUso: 'Normal'
  }, async () => ({ id: 10 }));

  assert.equal(resultado.idCliente, 1);
  assert.equal(resultado.propietario, 'Juan');
  assert.equal(resultado.nivelUso, 'Normal');
  assert.ok(operaciones.includes('COMMIT'));

  assert.ok(operaciones.some(op =>
    op.sql?.includes('INSERT INTO historial_kilometraje')
  ));
});

test('Cobertura: rechaza vehiculo inexistente al editar', async () => {
  const { rules } = crearMock(async () => [[]]);

  await assert.rejects(
    rules.guardarVehiculo(99, {
      kilometraje: 1000
    }, async () => ({ id: 99 })),
    /vehiculo no existe/
  );
});

test('Cobertura: rechaza orden con estado invalido', async () => {
  const { rules } = crearMock(async () => [[]]);

  await assert.rejects(
    rules.prepararOrden({}, {
      estado: 'Desconocido'
    }),
    /Estado de orden invalido/
  );
});

test('Cobertura: rechaza orden sin vehiculo', async () => {
  const { rules } = crearMock(async () => [[]]);

  await assert.rejects(
    rules.prepararOrden({
      execute: async () => [[]]
    }, {
      estado: 'Abierta',
      placa: 'ABC123'
    }),
    /Registra o selecciona el vehiculo/
  );
});

test('Cobertura: rechaza orden inexistente', async () => {
  const { rules } = crearMock(async () => [[]]);

  await assert.rejects(
    rules.prepararOrden({
      execute: async () => [[]]
    }, {
      estado: 'Abierta'
    }, 99),
    /orden no existe/
  );
});

test('Cobertura: rechaza mecanico invalido', async () => {
  const { rules } = crearMock(async () => [[]]);

  const connection = {
    execute: async sql => {
      if (sql.includes('FROM vehiculos')) {
        return [[{
          id_vehiculo: 1,
          placa: 'ABC123',
          kilometraje: 1000,
          id_cliente: 1
        }]];
      }
      if (sql.includes('FROM clientes')) {
        return [[{ nombre: 'Juan' }]];
      }
      if (sql.includes('FROM historial_kilometraje')) {
        return [[{ ultimo: 1000 }]];
      }
      return [[]];
    }
  };

  await assert.rejects(
    rules.prepararOrden(connection, {
      estado: 'Abierta',
      idVehiculo: 1,
      kilometraje: 1000,
      idMecanico: -5
    }),
    /Selecciona un mecanico valido/
  );
});

test('Cobertura: rechaza seleccion de servicios invalida', async () => {
  const { rules } = crearMock(async () => [[]]);

  const connection = {
    execute: async () => [{ affectedRows: 1 }]
  };

  await assert.rejects(
    rules.completarOrden(connection, 1, {
      estado: 'Abierta',
      kilometraje: 1000,
      servicios: 'invalido'
    }, {
      vehiculo: { id_vehiculo: 1 },
      nuevoKm: false,
      anterior: null
    }),
    /Seleccion de servicios invalida/
  );
});

test('Cobertura: rechaza servicio con identificador invalido', async () => {
  const { rules } = crearMock(async () => [[]]);

  const connection = {
    execute: async sql => {
      if (sql.includes('FROM detalle_servicio')) return [[]];
      return [{ affectedRows: 1 }];
    }
  };

  await assert.rejects(
    rules.completarOrden(connection, 1, {
      estado: 'Abierta',
      kilometraje: 1000,
      servicios: [-1]
    }, {
      vehiculo: { id_vehiculo: 1 },
      nuevoKm: false,
      anterior: null
    }),
    /Servicio invalido/
  );
});

test('Cobertura: rechaza servicio inactivo', async () => {
  const { rules } = crearMock(async () => [[]]);

  const connection = {
    execute: async sql => {
      if (sql.includes('FROM detalle_servicio')) return [[]];
      if (sql.includes('FROM servicios')) return [[]];
      return [{ affectedRows: 1 }];
    }
  };

  await assert.rejects(
    rules.completarOrden(connection, 1, {
      estado: 'Abierta',
      kilometraje: 1000,
      servicios: [5]
    }, {
      vehiculo: { id_vehiculo: 1 },
      nuevoKm: false,
      anterior: null
    }),
    /servicio seleccionado no esta activo/
  );
});

test('Cobertura: genera recordatorios', async () => {
  const { rules, operaciones } = crearMock(async () =>
    [{ affectedRows: 2 }]
  );

  await rules.generarRecordatorios();

  assert.ok(operaciones.some(op =>
    op.sql?.includes('INSERT INTO recordatorios')
  ));
});

test('Cobertura: dashboard sin mantenimientos', async () => {
  const { rules } = crearMock(async sql => {
    if (sql.includes('INSERT INTO recordatorios')) {
      return [{ affectedRows: 0 }];
    }
    if (sql.includes('COUNT(*) FROM vehiculos')) {
      return [[{
        vehiculos: 0,
        proximos: 0,
        vencidos: 0,
        atendidos: 0,
        enProceso: 0
      }]];
    }
    return [[]];
  });

  const resultado = await rules.dashboard();

  assert.equal(resultado.vehiculos, 0);
  assert.equal(resultado.proximos, 0);
  assert.equal(resultado.vencidos, 0);
  assert.deepEqual(resultado.servicios, []);
});

test('Cobertura: dashboard identifica servicio vencido', async () => {
  const { rules } = crearMock(async sql => {
    if (sql.includes('INSERT INTO recordatorios')) {
      return [{ affectedRows: 1 }];
    }
    if (sql.includes('COUNT(*) FROM vehiculos')) {
      return [[{
        vehiculos: 1,
        proximos: 0,
        vencidos: 1,
        atendidos: 1,
        enProceso: 0
      }]];
    }
    return [[{
      id_detalle_servicio: 1,
      fecha_proximo_servicio: '2020-01-01',
      kilometraje_proximo: 5000,
      kilometraje_actual: 6000
    }]];
  });

  const resultado = await rules.dashboard();

  assert.equal(resultado.vencidos, 1);
  assert.equal(resultado.servicios[0].estado_alerta, 'Servicio pasado');
  assert.equal(resultado.servicios[0].kilometros_restantes, -1000);
});
