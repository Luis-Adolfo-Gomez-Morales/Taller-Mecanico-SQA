const mysql = require('mysql2/promise');
const localConfig = require('./db-config');
const { validarCliente, correoValido } = require('./scripts/cliente-validation');

const dbConfig = {
    host: process.env.DB_HOST || localConfig.host || '127.0.0.1',
    port: Number(process.env.DB_PORT || localConfig.port || 3306),
    user: process.env.DB_USER || localConfig.user || 'root',
    password: process.env.DB_PASSWORD || localConfig.password || '',
    database: process.env.DB_NAME || localConfig.database || 'taller_ttc',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
};

// Permite usar una conexion transaccional en las pruebas sin ejecutar codigo dinamico.
function createDatabase(pool) {
const rules = require('./maintenance-rules').createRules(pool);
const maintenance = require('./maintenance-layer').createMaintenanceLayer(pool, { listClientes: listPilotos, createCliente: createPiloto });

function buildDatabaseError(error) {
    if (error && error.code === 'ER_ACCESS_DENIED_ERROR') {
        const passwordHint = dbConfig.password ? 'La contrasena configurada no fue aceptada.' : 'No hay contrasena configurada.';
        return new Error(`${passwordHint} Revisa src/db-config.js o las variables DB_USER y DB_PASSWORD para el usuario "${dbConfig.user}" en MySQL.`);
    }

    return error;
}

function emptyToNull(value) {
    return value === '' || value === undefined ? null : value;
}

function mapVehiculo(row) {
    return {
        id: row.id_vehiculo,
        idCliente: row.id_cliente,
        creadoPor: row.creado_por,
        nivelUso: row.nivel_uso,
        placa: row.placa,
        nit: row.nit,
        cui: row.cui,
        propietario: row.propietario,
        cliente: row.cliente,
        uso: row.uso,
        tipo: row.tipo,
        marca: row.marca,
        linea: row.linea,
        modelo: row.modelo,
        color: row.color,
        chasis: row.chasis,
        serie: row.serie,
        vin: row.vin,
        motor: row.motor,
        asientos: row.asientos,
        ejes: row.ejes,
        cilindros: row.cilindros,
        cc: row.cc,
        tonelaje: row.tonelaje,
        kilometraje: row.kilometraje,
        estado: row.estado
    };
}

function mapPiloto(row) {
    // Conservar los nombres consumidos por los modulos existentes.
    return {
        id: row.id_cliente,
        tipoPersona: row.tipo_persona,
        nombre: row.nombre,
        dpi: row.dpi,
        telefono: row.telefono,
        correo: row.correo,
        licencia: row.licencia,
        tipoLicencia: row.tipo_licencia,
        venceLicencia: row.vence_licencia,
        estado: row.estado,
        vehiculo: '',
        vehiculos: [],
        direccion: row.direccion,
        contactoEmpresa: row.contacto_empresa,
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion
    };
}

function mapRepuesto(row) {
    return {
        id: row.id_repuesto,
        codigo: row.codigo,
        nombre: row.nombre,
        descripcion: row.descripcion,
        existencia: Number(row.existencia) || 0,
        costo: Number(row.precio_unitario) || 0,
        estado: row.estado
    };
}

function mapRepuestoMovimiento(row) {
    return {
        id: row.id_movimiento,
        idRepuesto: row.id_repuesto,
        codigo: row.codigo,
        nombre: row.nombre,
        tipo: row.tipo,
        cantidad: Number(row.cantidad) || 0,
        existenciaAnterior: Number(row.existencia_anterior) || 0,
        existenciaNueva: Number(row.existencia_nueva) || 0,
        costo: Number(row.precio_unitario) || 0,
        referencia: row.referencia,
        observaciones: row.observaciones,
        fecha: row.fecha_movimiento
    };
}

function mapOrden(row) {
    return {
        id: row.id_orden,
        fechaCreacion: row.fecha_creacion,
        idVehiculo: row.id_vehiculo,
        numero: row.numero,
        serie: row.serie,
        fechaEntrada: row.fecha_entrada,
        horaEntrada: row.hora_entrada ? String(row.hora_entrada).slice(0, 5) : '',
        periodoEntrada: row.periodo_entrada,
        fechaSalida: row.fecha_salida,
        horaSalida: row.hora_salida ? String(row.hora_salida).slice(0, 5) : '',
        periodoSalida: row.periodo_salida,
        vehiculo: row.vehiculo,
        placa: row.placa,
        piloto: row.piloto,
        marca: row.marca,
        mecanico: row.mecanico,
        idMecanico: row.id_mecanico,
        departamento: row.departamento,
        kilometraje: row.kilometraje,
        proximoServicio: row.proximo_servicio,
        tipoVehiculo: row.tipo_vehiculo,
        estado: row.estado,
        manoMecanico: Boolean(row.mano_mecanico),
        manoElectronico: Boolean(row.mano_electronico),
        manoPintura: Boolean(row.mano_pintura),
        manoPinchazo: Boolean(row.mano_pinchazo),
        totalManoObra: Number(row.total_mano_obra) || 0,
        totalRepuestos: Number(row.total_repuestos) || 0,
        trabajos: row.trabajos,
        observaciones: row.observaciones,
        repuestos: []
    };
}

function mapOrdenRepuesto(row) {
    return {
        id: row.id_orden_repuesto,
        idRepuesto: row.id_repuesto,
        codigo: row.codigo,
        nombre: row.nombre,
        cantidad: Number(row.cantidad) || 1,
        cantidadTexto: row.cantidad_texto,
        costo: Number(row.precio_unitario) || 0,
        subtotal: Number(row.subtotal) || 0
    };
}

async function listVehiculos() {
    const [rows] = await pool.query('SELECT v.*, c.nombre AS cliente FROM vehiculos v LEFT JOIN clientes c ON c.id_cliente = v.id_cliente ORDER BY v.id_vehiculo DESC');
    return rows.map(mapVehiculo);
}

async function createVehiculo(vehiculo, idUsuario) {
    if (!Number.isInteger(idUsuario) || idUsuario <= 0) throw new Error('Inicia sesion para registrar un vehiculo.');
    return rules.guardarVehiculo(null, vehiculo, async (connection, value) => {
        const [usuarios] = await connection.execute("SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND estado = 'Activo'", [idUsuario]);
        if (!usuarios.length) throw new Error('El usuario de la sesion ya no esta activo. Inicia sesion nuevamente.');
        return insertVehiculo(value, connection, idUsuario);
    });
}
async function updateVehiculo(id, vehiculo) {
    return rules.guardarVehiculo(id, vehiculo, (connection, value) => editVehiculo(id, value, connection));
}

async function insertVehiculo(vehiculo, connection, idUsuario) {
    const modelo = String(vehiculo.modelo || '').trim();
    const [result] = await connection.execute(`
        INSERT INTO vehiculos (
            placa, nit, cui, propietario, uso, tipo, marca, linea,
            modelo, color, chasis, serie, vin, motor, asientos, ejes,
            cilindros, cc, tonelaje, kilometraje, estado, creado_por, fecha_creacion, fecha_actualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
        vehiculo.placa, emptyToNull(vehiculo.nit), emptyToNull(vehiculo.cui),
        emptyToNull(vehiculo.propietario), emptyToNull(vehiculo.uso),
        emptyToNull(vehiculo.tipo), emptyToNull(vehiculo.marca), emptyToNull(vehiculo.linea), emptyToNull(modelo),
        emptyToNull(vehiculo.color), emptyToNull(vehiculo.chasis),
        emptyToNull(vehiculo.serie), emptyToNull(vehiculo.vin), emptyToNull(vehiculo.motor),
        Number(vehiculo.asientos) || 0, Number(vehiculo.ejes) || 0, Number(vehiculo.cilindros) || 0,
        Number(vehiculo.cc) || 0, Number(vehiculo.tonelaje) || 0, Number(vehiculo.kilometraje) || 0,
        vehiculo.estado || 'Activo', idUsuario
    ]);
    return getVehiculo(result.insertId, connection);
}

async function editVehiculo(id, vehiculo, connection) {
    const modelo = String(vehiculo.modelo || '').trim();
    await connection.execute(`
        UPDATE vehiculos SET
            placa = ?, nit = ?, cui = ?, propietario = ?, uso = ?, tipo = ?,
            marca = ?, linea = ?, modelo = ?, color = ?, chasis = ?, serie = ?,
            vin = ?, motor = ?, asientos = ?, ejes = ?, cilindros = ?, cc = ?, tonelaje = ?,
            kilometraje = ?, estado = ?, fecha_actualizacion = NOW()
        WHERE id_vehiculo = ?
    `, [
        vehiculo.placa, emptyToNull(vehiculo.nit), emptyToNull(vehiculo.cui),
        emptyToNull(vehiculo.propietario), emptyToNull(vehiculo.uso),
        emptyToNull(vehiculo.tipo), emptyToNull(vehiculo.marca), emptyToNull(vehiculo.linea), emptyToNull(modelo),
        emptyToNull(vehiculo.color), emptyToNull(vehiculo.chasis),
        emptyToNull(vehiculo.serie), emptyToNull(vehiculo.vin), emptyToNull(vehiculo.motor),
        Number(vehiculo.asientos) || 0, Number(vehiculo.ejes) || 0, Number(vehiculo.cilindros) || 0,
        Number(vehiculo.cc) || 0, Number(vehiculo.tonelaje) || 0, Number(vehiculo.kilometraje) || 0,
        vehiculo.estado || 'Activo', id
    ]);
    return getVehiculo(id, connection);
}

async function getVehiculo(id, connection = pool) {
    const [rows] = await connection.execute('SELECT v.*, c.nombre AS cliente FROM vehiculos v LEFT JOIN clientes c ON c.id_cliente = v.id_cliente WHERE v.id_vehiculo = ?', [id]);
    return rows[0] ? mapVehiculo(rows[0]) : null;
}

async function setEstadoVehiculo(id, estado) {
    if (!Number.isInteger(id) || id <= 0 || !['Activo', 'Inactivo'].includes(estado)) {
        throw new Error('Vehiculo o estado invalido.');
    }
    await pool.execute('UPDATE vehiculos SET estado = ?, fecha_actualizacion = NOW() WHERE id_vehiculo = ?', [estado, id]);
    const vehiculo = await getVehiculo(id);
    if (!vehiculo) throw new Error('El vehiculo ya no existe.');
    return vehiculo;
}

async function deleteVehiculo(id) {
    validarIdEliminacion(id);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [vehiculos] = await connection.execute('SELECT id_vehiculo FROM vehiculos WHERE id_vehiculo = ? FOR UPDATE', [id]);
        if (!vehiculos.length) throw new Error('El vehiculo ya no existe. Actualiza el listado.');
        const [ordenes] = await connection.execute('SELECT id_orden FROM ordenes_trabajo WHERE id_vehiculo = ? LIMIT 1', [id]);
        if (ordenes.length) throw new Error('El vehiculo tiene ordenes de trabajo. Puedes desactivarlo desde Editar para conservar su historial.');
        const [historial] = await connection.execute("SELECT id_historial_kilometraje FROM historial_kilometraje WHERE id_vehiculo = ? AND (origen <> 'Registro de vehiculo' OR id_orden IS NOT NULL) LIMIT 1", [id]);
        if (historial.length) throw new Error('El vehiculo tiene historial de kilometraje. Puedes desactivarlo desde Editar para conservarlo.');
        // El kilometraje inicial forma parte del registro que se esta eliminando.
        await connection.execute('DELETE FROM historial_kilometraje WHERE id_vehiculo = ?', [id]);
        await connection.execute('DELETE FROM vehiculos WHERE id_vehiculo = ?', [id]);
        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw errorEliminacion(error, 'El vehiculo tiene registros relacionados y no se puede eliminar. Puedes desactivarlo desde Editar.');
    } finally {
        connection.release();
    }
}

function validarIdEliminacion(id) {
    if (!Number.isInteger(id) || id <= 0) throw new Error('Selecciona un registro valido.');
}

function errorEliminacion(error, mensaje) {
    return ['ER_ROW_IS_REFERENCED', 'ER_ROW_IS_REFERENCED_2'].includes(error.code) ? new Error(mensaje) : error;
}

// La licencia sigue activa durante su fecha de vencimiento. Sin fecha: inactiva.
const estadoClienteSQL = "IF(vence_licencia >= CURDATE(), 'Activo', 'Inactivo')";

async function listPilotos() {
    await pool.query(`UPDATE clientes SET estado = ${estadoClienteSQL} WHERE estado <> ${estadoClienteSQL}`);
    const [rows] = await pool.query(`SELECT clientes.*, ${estadoClienteSQL} AS estado FROM clientes ORDER BY id_cliente DESC`);
    return adjuntarVehiculosClientes(rows.map(mapPiloto));
}

async function adjuntarVehiculosClientes(clientes) {
    if (!clientes.length) return clientes;
    const [vehiculos] = await pool.query(
        'SELECT id_vehiculo, id_cliente, placa, modelo FROM vehiculos WHERE id_cliente IN (?) ORDER BY placa',
        [clientes.map(cliente => cliente.id)]
    );
    const porCliente = new Map();
    for (const row of vehiculos) {
        if (!porCliente.has(row.id_cliente)) porCliente.set(row.id_cliente, []);
        porCliente.get(row.id_cliente).push({ id: row.id_vehiculo, placa: row.placa, modelo: row.modelo });
    }
    return clientes.map(cliente => {
        const vinculados = porCliente.get(cliente.id) || [];
        return { ...cliente, vehiculos: vinculados, vehiculo: vinculados.map(v => v.placa).join(', ') };
    });
}

function clienteValues(cliente) {
    return [cliente.tipoPersona, cliente.nombre, cliente.dpi,
        cliente.telefono, cliente.correo, cliente.licencia, cliente.tipoLicencia,
        cliente.venceLicencia, cliente.direccion, cliente.contactoEmpresa];
}

function clienteDatabaseError(error) {
    if (error.code === 'ER_DUP_ENTRY') return new Error('Ya existe un cliente con esos datos.');
    return error;
}

async function createPiloto(value) {
    const cliente = validarCliente(value);
    try {
        const [result] = await pool.execute(`
            INSERT INTO clientes (
                tipo_persona, nombre, dpi, telefono, correo, licencia,
                tipo_licencia, vence_licencia, direccion, contacto_empresa,
                estado, fecha_creacion, fecha_actualizacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, IF(? >= CURDATE(), 'Activo', 'Inactivo'), NOW(), NOW())
        `, [...clienteValues(cliente), cliente.venceLicencia]);
        return getPiloto(result.insertId);
    } catch (error) { throw clienteDatabaseError(error); }
}

async function updatePiloto(id, value) {
    const cliente = validarCliente(value);
    try {
        await pool.execute(`
            UPDATE clientes SET tipo_persona = ?, nombre = ?, dpi = ?,
                telefono = ?, correo = ?, licencia = ?, tipo_licencia = ?, vence_licencia = ?,
                direccion = ?, contacto_empresa = ?,
                estado = IF(? >= CURDATE(), 'Activo', 'Inactivo'), fecha_actualizacion = NOW()
            WHERE id_cliente = ?
        `, [...clienteValues(cliente), cliente.venceLicencia, id]);
        const result = await getPiloto(id);
        if (!result) throw new Error('El cliente ya no existe.');
        return result;
    } catch (error) { throw clienteDatabaseError(error); }
}

async function getPiloto(id) {
    const [rows] = await pool.execute(`SELECT clientes.*, ${estadoClienteSQL} AS estado FROM clientes WHERE id_cliente = ?`, [id]);
    return rows[0] ? (await adjuntarVehiculosClientes([mapPiloto(rows[0])]))[0] : null;
}

async function deletePiloto(id) {
    validarIdEliminacion(id);
    try {
        const [vehiculos] = await pool.execute('SELECT id_vehiculo FROM vehiculos WHERE id_cliente = ? LIMIT 1', [id]);
        if (vehiculos.length) throw new Error('El cliente tiene vehiculos vinculados. No se puede eliminar mientras conserve esos vehiculos.');
        const [result] = await pool.execute('DELETE FROM clientes WHERE id_cliente = ?', [id]);
        if (!result.affectedRows) throw new Error('El cliente ya no existe. Actualiza el listado.');
        return true;
    } catch (error) {
        throw errorEliminacion(error, 'El cliente tiene registros relacionados y no se puede eliminar.');
    }
}

async function listRepuestos() {
    const [rows] = await pool.query('SELECT * FROM inventario_repuestos ORDER BY nombre ASC');
    return rows.map(mapRepuesto);
}

async function ensureRepuestosMovimientosTable(connection = pool) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS repuestos_movimientos (
            id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
            id_repuesto INT NOT NULL,
            codigo VARCHAR(50) NOT NULL,
            nombre VARCHAR(150) NOT NULL,
            tipo ENUM('Ingreso', 'Salida') NOT NULL,
            cantidad DECIMAL(10, 2) NOT NULL,
            existencia_anterior DECIMAL(10, 2) NOT NULL DEFAULT 0,
            existencia_nueva DECIMAL(10, 2) NOT NULL DEFAULT 0,
            precio_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0,
            referencia VARCHAR(120) NULL,
            observaciones TEXT NULL,
            fecha_movimiento DATETIME NOT NULL,
            INDEX idx_repuestos_movimientos_repuesto (id_repuesto),
            INDEX idx_repuestos_movimientos_tipo_fecha (tipo, fecha_movimiento)
        )
    `);
}

async function getRepuesto(id, connection = pool) {
    const [rows] = await connection.execute('SELECT * FROM inventario_repuestos WHERE id_repuesto = ?', [id]);
    return rows[0] ? mapRepuesto(rows[0]) : null;
}

async function createRepuesto(repuesto) {
    const [result] = await pool.execute(`
        INSERT INTO inventario_repuestos (
            codigo, nombre, descripcion, existencia, precio_unitario, estado, fecha_creacion, fecha_actualizacion
        ) VALUES (?, ?, ?, ?, ?, 'Activo', NOW(), NOW())
    `, [
        repuesto.codigo,
        repuesto.nombre,
        emptyToNull(repuesto.descripcion),
        Number(repuesto.existencia) || 0,
        Number(repuesto.costo) || 0
    ]);

    return getRepuesto(result.insertId);
}

async function createRepuestoMovimiento(movimiento) {
    await ensureRepuestosMovimientosTable();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const [rows] = await connection.execute('SELECT * FROM inventario_repuestos WHERE id_repuesto = ? FOR UPDATE', [movimiento.idRepuesto]);
        const repuesto = rows[0] ? mapRepuesto(rows[0]) : null;

        if (!repuesto) {
            throw new Error('El repuesto seleccionado no existe.');
        }

        const cantidad = Number(movimiento.cantidad) || 0;

        if (cantidad <= 0) {
            throw new Error('La cantidad debe ser mayor que cero.');
        }

        const tipo = movimiento.tipo === 'Salida' ? 'Salida' : 'Ingreso';
        const existenciaAnterior = Number(repuesto.existencia) || 0;
        const existenciaNueva = tipo === 'Ingreso'
            ? existenciaAnterior + cantidad
            : existenciaAnterior - cantidad;

        if (existenciaNueva < 0) {
            throw new Error('No hay existencia suficiente para registrar la salida.');
        }

        const costo = Number(movimiento.costo || repuesto.costo) || 0;

        await connection.execute(`
            UPDATE inventario_repuestos
            SET existencia = ?, precio_unitario = ?, fecha_actualizacion = NOW()
            WHERE id_repuesto = ?
        `, [existenciaNueva, costo, repuesto.id]);

        const [result] = await connection.execute(`
            INSERT INTO repuestos_movimientos (
                id_repuesto, codigo, nombre, tipo, cantidad, existencia_anterior, existencia_nueva,
                precio_unitario, referencia, observaciones, fecha_movimiento
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            repuesto.id,
            repuesto.codigo,
            repuesto.nombre,
            tipo,
            cantidad,
            existenciaAnterior,
            existenciaNueva,
            costo,
            emptyToNull(movimiento.referencia),
            emptyToNull(movimiento.observaciones)
        ]);

        await connection.commit();
        return {
            id: result.insertId,
            repuesto: await getRepuesto(repuesto.id)
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function listRepuestoMovimientos() {
    await ensureRepuestosMovimientosTable();
    const [rows] = await pool.query('SELECT * FROM repuestos_movimientos ORDER BY fecha_movimiento DESC, id_movimiento DESC LIMIT 200');
    return rows.map(mapRepuestoMovimiento);
}

async function listUltimosIngresosRepuestos() {
    await ensureRepuestosMovimientosTable();
    const [rows] = await pool.query(`
        SELECT *
        FROM repuestos_movimientos
        WHERE tipo = 'Ingreso'
        ORDER BY fecha_movimiento DESC, id_movimiento DESC
        LIMIT 8
    `);
    return rows.map(mapRepuestoMovimiento);
}

async function listOrdenes() {
    const [ordenRows] = await pool.query('SELECT * FROM ordenes_trabajo ORDER BY id_orden DESC');
    const [detalles] = await pool.query("SELECT id_orden, id_servicio FROM detalle_servicio WHERE estado_mantenimiento <> 'Cancelado'");
    const ordenes = ordenRows.map(row => ({ ...mapOrden(row), servicios: detalles.filter(d => d.id_orden === row.id_orden).map(d => d.id_servicio) }));

    if (ordenes.length === 0) {
        return ordenes;
    }

    const ids = ordenes.map((orden) => orden.id);
    const [repuestoRows] = await pool.query('SELECT * FROM orden_repuestos WHERE id_orden IN (?) ORDER BY id_orden_repuesto ASC', [ids]);
    const repuestosPorOrden = new Map();

    repuestoRows.forEach((row) => {
        const items = repuestosPorOrden.get(row.id_orden) || [];
        items.push(mapOrdenRepuesto(row));
        repuestosPorOrden.set(row.id_orden, items);
    });

    return ordenes.map((orden) => ({
        ...orden,
        repuestos: repuestosPorOrden.get(orden.id) || []
    }));
}

async function saveOrdenRepuestos(connection, idOrden, repuestos) {
    if (repuestos === undefined) return;
    if (!Array.isArray(repuestos)) throw new Error('Listado de repuestos invalido.');
    const [anteriores] = await connection.execute('SELECT * FROM orden_repuestos WHERE id_orden = ? FOR UPDATE', [idOrden]);
    const previos = new Map();
    for (const row of anteriores) {
        const key = Number(row.id_repuesto);
        const previo = previos.get(key) || {cantidad:0, descontada:0};
        previo.cantidad += Number(row.cantidad); previo.descontada += Number(row.cantidad_descontada);
        previos.set(key, previo);
    }
    const nuevos = new Map();
    for (const repuesto of repuestos) {
        const id = Number(repuesto.idRepuesto), cantidad = Number(repuesto.cantidad), costo = Number(repuesto.costo);
        if (!Number.isInteger(id) || id <= 0) throw new Error('Selecciona cada repuesto desde el inventario.');
        if (!Number.isFinite(cantidad) || cantidad <= 0 || Math.abs(cantidad*100 - Math.round(cantidad*100)) > 0.000001) throw new Error('La cantidad debe ser positiva y tener hasta dos decimales.');
        if (!Number.isFinite(costo) || costo < 0) throw new Error('Costo de repuesto invalido.');
        if (nuevos.has(id)) throw new Error('Agrupa el repuesto repetido en una sola cantidad.');
        nuevos.set(id, {...repuesto, cantidad, costo});
    }
    const ids = [...new Set([...previos.keys(), ...nuevos.keys()])].filter(id => id > 0).sort((a,b)=>a-b);
    for (const id of ids) {
        const previo = previos.get(id) || {cantidad:0, descontada:0};
        const nuevo = nuevos.get(id);
        const cantidad = nuevo?.cantidad || 0;
        const descontada = Math.max(0, Math.round((previo.descontada + cantidad - previo.cantidad)*100)/100);
        const diferencia = Math.round((descontada - previo.descontada)*100)/100;
        const [rows] = await connection.execute('SELECT * FROM inventario_repuestos WHERE id_repuesto = ? FOR UPDATE', [id]);
        const item = rows[0];
        if (!item) throw new Error('El repuesto ya no existe en inventario.');
        if (nuevo) { nuevo.descontada = descontada; nuevo.codigo = item.codigo; nuevo.nombre = item.nombre; }
        if (!diferencia) continue;
        const anterior = Number(item.existencia), existencia = Math.round((anterior - diferencia)*100)/100;
        if (existencia < 0) throw new Error(`Existencia insuficiente para ${item.nombre}. Disponible: ${anterior}.`);
        await connection.execute('UPDATE inventario_repuestos SET existencia = ?, fecha_actualizacion = NOW() WHERE id_repuesto = ?', [existencia,id]);
        await connection.execute(`INSERT INTO repuestos_movimientos
            (id_repuesto,codigo,nombre,tipo,cantidad,existencia_anterior,existencia_nueva,precio_unitario,referencia,observaciones,fecha_movimiento)
            VALUES (?,?,?,?,?,?,?,?,?,?,NOW())`, [id,item.codigo,item.nombre,diferencia > 0 ? 'Salida' : 'Ingreso',Math.abs(diferencia),anterior,existencia,item.precio_unitario,`Orden #${idOrden}`,diferencia > 0 ? 'Repuesto utilizado en orden' : 'Devolucion por ajuste de orden']);
    }
    await connection.execute('DELETE FROM orden_repuestos WHERE id_orden = ?', [idOrden]);
    for (const [id, repuesto] of nuevos) {
        await connection.execute(`INSERT INTO orden_repuestos
            (id_orden,id_repuesto,codigo,nombre,cantidad,cantidad_texto,precio_unitario,subtotal,cantidad_descontada)
            VALUES (?,?,?,?,?,?,?,?,?)`, [idOrden,id,repuesto.codigo,repuesto.nombre,repuesto.cantidad,emptyToNull(repuesto.cantidadTexto),repuesto.costo,repuesto.cantidad*repuesto.costo,repuesto.descontada]);
    }
}

async function createOrden(value) {
    const orden = { ...value };
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const contexto = await rules.prepararOrden(connection, orden);
        const [result] = await connection.execute(`
            INSERT INTO ordenes_trabajo (
                numero, serie, fecha_entrada, hora_entrada, periodo_entrada, fecha_salida, hora_salida,
                periodo_salida, vehiculo, placa, piloto, marca, mecanico, departamento, kilometraje,
                proximo_servicio, tipo_vehiculo, estado, mano_mecanico, mano_electronico, mano_pintura, mano_pinchazo,
                total_mano_obra, total_repuestos, trabajos, observaciones, fecha_creacion, fecha_actualizacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            orden.numero, String(orden.serie || 'SERIE A').toUpperCase(), orden.fechaEntrada, orden.horaEntrada, orden.periodoEntrada || 'AM',
            emptyToNull(orden.fechaSalida), emptyToNull(orden.horaSalida), orden.periodoSalida || 'PM',
            emptyToNull(orden.vehiculo), orden.placa, emptyToNull(orden.piloto), emptyToNull(orden.marca),
            emptyToNull(orden.mecanico), emptyToNull(orden.departamento), Number(orden.kilometraje) || 0,
            emptyToNull(orden.proximoServicio), emptyToNull(orden.tipoVehiculo), orden.estado || 'Abierta',
            orden.manoMecanico ? 1 : 0, orden.manoElectronico ? 1 : 0, orden.manoPintura ? 1 : 0, orden.manoPinchazo ? 1 : 0,
            Number(orden.totalManoObra) || 0, Number(orden.totalRepuestos) || 0,
            emptyToNull(orden.trabajos), emptyToNull(orden.observaciones)
        ]);

        await rules.completarOrden(connection, result.insertId, orden, contexto);
        await saveOrdenRepuestos(connection, result.insertId, orden.repuestos);
        await connection.commit();
        return getOrden(result.insertId);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function updateOrden(id, value) {
    const orden = { ...value };
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const contexto = await rules.prepararOrden(connection, orden, id);
        await connection.execute(`
            UPDATE ordenes_trabajo SET
                numero = ?, serie = ?, fecha_entrada = ?, hora_entrada = ?, periodo_entrada = ?,
                fecha_salida = ?, hora_salida = ?, periodo_salida = ?, vehiculo = ?, placa = ?,
                piloto = ?, marca = ?, mecanico = ?, departamento = ?, kilometraje = ?,
                proximo_servicio = ?, tipo_vehiculo = ?, estado = ?, mano_mecanico = ?,
                mano_electronico = ?, mano_pintura = ?, mano_pinchazo = ?, total_mano_obra = ?, total_repuestos = ?,
                trabajos = ?, observaciones = ?, fecha_actualizacion = NOW()
            WHERE id_orden = ?
        `, [
            orden.numero, String(orden.serie || 'SERIE A').toUpperCase(), orden.fechaEntrada, orden.horaEntrada, orden.periodoEntrada || 'AM',
            emptyToNull(orden.fechaSalida), emptyToNull(orden.horaSalida), orden.periodoSalida || 'PM',
            emptyToNull(orden.vehiculo), orden.placa, emptyToNull(orden.piloto), emptyToNull(orden.marca),
            emptyToNull(orden.mecanico), emptyToNull(orden.departamento), Number(orden.kilometraje) || 0,
            emptyToNull(orden.proximoServicio), emptyToNull(orden.tipoVehiculo), orden.estado || 'Abierta',
            orden.manoMecanico ? 1 : 0, orden.manoElectronico ? 1 : 0, orden.manoPintura ? 1 : 0, orden.manoPinchazo ? 1 : 0,
            Number(orden.totalManoObra) || 0, Number(orden.totalRepuestos) || 0,
            emptyToNull(orden.trabajos), emptyToNull(orden.observaciones), id
        ]);

        await rules.completarOrden(connection, id, orden, contexto);
        await saveOrdenRepuestos(connection, id, orden.repuestos);
        await connection.commit();
        return getOrden(id);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getOrden(id) {
    const [rows] = await pool.execute('SELECT * FROM ordenes_trabajo WHERE id_orden = ?', [id]);
    if (!rows[0]) {
        return null;
    }

    const orden = mapOrden(rows[0]);
    const [repuestos] = await pool.execute('SELECT * FROM orden_repuestos WHERE id_orden = ? ORDER BY id_orden_repuesto ASC', [id]);
    orden.repuestos = repuestos.map(mapOrdenRepuesto);
    const [detalles] = await pool.execute("SELECT id_servicio FROM detalle_servicio WHERE id_orden = ? AND estado_mantenimiento <> 'Cancelado'", [id]);
    orden.servicios = detalles.map(d => d.id_servicio);
    return orden;
}

async function deleteOrden(id) {
    validarIdEliminacion(id);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [rows] = await connection.execute('SELECT estado FROM ordenes_trabajo WHERE id_orden = ? FOR UPDATE', [id]);
        if (!rows.length) throw new Error('La orden ya no existe.');
        if (rows[0].estado === 'Finalizada') throw new Error('No se puede eliminar una orden finalizada.');
        await saveOrdenRepuestos(connection, id, []);
        await connection.execute('DELETE FROM ordenes_trabajo WHERE id_orden = ?', [id]);
        await connection.commit(); return true;
    } catch(error) { await connection.rollback(); throw errorEliminacion(error, 'La orden tiene servicios vinculados y no se puede eliminar.'); }
    finally { connection.release(); }
}

async function authenticateUser(usuario, password) {
    try {
        if (typeof usuario !== 'string' || typeof password !== 'string' || !usuario.trim() || !password) {
            return null;
        }

        const [rows] = await pool.execute(`
            SELECT id_usuario, usuario, nombre
            FROM usuarios
            WHERE usuario = ?
                AND password_hash = ?
                AND estado = 'Activo'
            LIMIT 1
        `, [usuario.trim(), password]);
        const user = rows[0];

        if (!user) {
            return null;
        }

        await pool.execute('UPDATE usuarios SET ultimo_acceso = NOW(), fecha_actualizacion = NOW() WHERE id_usuario = ?', [user.id_usuario]);

        return {
            id: user.id_usuario,
            usuario: user.usuario,
            nombre: user.nombre
        };
    } catch (error) {
        throw buildDatabaseError(error);
    }
}

function validarMecanico(value) {
    const data = {};
    for (const [key, max] of [['nombre',150],['dpi',30],['correo',150],['direccion',255]]) {
        data[key] = String(value[key] ?? '').trim();
        if (!data[key] || data[key].length > max) throw new Error('Completa correctamente todos los campos del mecanico.');
    }
    data.edad = Number(value.edad);
    if (!Number.isInteger(data.edad) || data.edad < 18 || data.edad > 100) throw new Error('La edad debe estar entre 18 y 100.');
    if (!/^\d{13}$/.test(data.dpi)) throw new Error('El DPI debe tener 13 digitos.');
    if (!correoValido(data.correo)) throw new Error('Ingresa un correo valido.');
    data.fecha_contratacion = String(value.fecha_contratacion || '');
    const fecha = new Date(data.fecha_contratacion + 'T12:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.fecha_contratacion) || Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0,10) !== data.fecha_contratacion) throw new Error('Fecha de contratacion invalida.');
    return data;
}
async function listMecanicos() {
    const [rows] = await pool.query('SELECT * FROM mecanicos ORDER BY nombre, id_mecanico'); return rows;
}
async function saveMecanico(id, value) {
    const m = validarMecanico(value);
    const values = [m.nombre,m.edad,m.dpi,m.correo,m.direccion,m.fecha_contratacion];
    try {
        if (id !== null && id !== undefined) {
            validarIdEliminacion(id);
            const [rows] = await pool.execute('SELECT id_mecanico FROM mecanicos WHERE id_mecanico = ?', [id]);
            if (!rows.length) throw new Error('El mecanico ya no existe.');
            await pool.execute('UPDATE mecanicos SET nombre=?, edad=?, dpi=?, correo=?, direccion=?, fecha_contratacion=? WHERE id_mecanico=?', [...values,id]);
        } else {
            const [result] = await pool.execute('INSERT INTO mecanicos (nombre,edad,dpi,correo,direccion,fecha_contratacion,fecha_registro) VALUES (?,?,?,?,?,?,NOW())',values); id=result.insertId;
        }
        const [rows] = await pool.execute('SELECT * FROM mecanicos WHERE id_mecanico=?',[id]); return rows[0];
    } catch(error) { if(error.code === 'ER_DUP_ENTRY') throw new Error('Ya existe un mecanico con ese DPI.'); throw error; }
}

// Historial verificable a partir de registros persistidos; no inventa cambios anteriores.
async function listHistorial() {
    const [rows] = await pool.query(`
        SELECT o.id_orden, o.id_vehiculo, o.fecha_entrada AS fecha, o.placa,
            o.vehiculo, CONCAT(o.serie, ' - ', o.numero) AS orden, o.kilometraje,
            o.mecanico, o.trabajos, o.observaciones, o.estado,
            'Ingreso a taller' AS evento, o.fecha_creacion AS fecha_registro
        FROM ordenes_trabajo o
        UNION ALL
        SELECT NULL, h.id_vehiculo, h.fecha_registro, v.placa, v.modelo, NULL,
            h.kilometraje, NULL, NULL, h.observaciones, NULL, h.origen, h.fecha_registro
        FROM historial_kilometraje h JOIN vehiculos v ON v.id_vehiculo = h.id_vehiculo
        WHERE h.id_orden IS NULL
        ORDER BY fecha DESC, fecha_registro DESC, id_orden DESC
    `);
    const [servicios] = await pool.query(`SELECT ds.id_orden, s.nombre, ds.estado_mantenimiento
        FROM detalle_servicio ds JOIN servicios s ON s.id_servicio = ds.id_servicio
        ORDER BY ds.id_detalle_servicio`);
    const porOrden = new Map();
    for (const servicio of servicios) {
        if (!porOrden.has(servicio.id_orden)) porOrden.set(servicio.id_orden, []);
        porOrden.get(servicio.id_orden).push(`${servicio.nombre} (${servicio.estado_mantenimiento})`);
    }
    return rows.map(row => ({...row, servicios: (porOrden.get(row.id_orden) || []).join('; ')}));
}

return {
    actualizarKilometraje: rules.actualizarKilometraje,
    listMecanicos, saveMecanico,
    listHistorial,
    setEstadoVehiculo,
    dashboard: rules.dashboard,
    generarRecordatorios: rules.generarRecordatorios,
    listServicios: maintenance.listServicios,
    authenticateUser,
    listVehiculos,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo,
    listPilotos,
    createPiloto,
    updatePiloto,
    deletePiloto,
    listRepuestos,
    createRepuesto,
    createRepuestoMovimiento,
    listRepuestoMovimientos,
    listUltimosIngresosRepuestos,
    listOrdenes,
    createOrden,
    updateOrden,
    deleteOrden
};

}

module.exports = { ...createDatabase(mysql.createPool(dbConfig)), createDatabase };
