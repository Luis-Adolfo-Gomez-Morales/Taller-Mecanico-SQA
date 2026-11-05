// Reglas de kilometraje y mantenimiento para la base del taller.
function kilometrajeValido(value) {
    const km = Number(value);
    if (value === '' || value === null || value === undefined || !Number.isFinite(km) || km < 0 || km > 9999999999.99) {
        throw new Error('El kilometraje debe ser un numero valido mayor o igual a cero.');
    }
    return Math.round(km * 100) / 100;
}

function proximaFecha(fecha, dias, nivel = 'Normal') {
    const factores = { Bajo: 1.25, Normal: 1, Alto: 0.75 };
    if (!(nivel in factores)) throw new Error('Nivel de uso invalido.');
    if (!dias || Number(dias) <= 0) return null;
    const base = String(fecha).slice(0, 10);
    const date = new Date(base + 'T00:00:00Z');
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== base) throw new Error('Fecha de servicio invalida.');
    date.setUTCDate(date.getUTCDate() + Math.max(1, Math.round(Number(dias) * factores[nivel])));
    return date.toISOString().slice(0, 10);
}

function diasParaServicio(fecha, hoy = new Date()) {
    if (!fecha) return null;
    const partes = String(fecha).slice(0,10).split('-').map(Number);
    const destino = Date.UTC(partes[0], partes[1]-1, partes[2]);
    if (!Number.isFinite(destino)) return null;
    const actual = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    return Math.round((destino - actual) / 86400000);
}

function estadoMantenimiento(kilometros, dias) {
    const km = kilometros === null || kilometros === undefined
  ? null
  : Number(kilometros);
    const fecha = dias === null || dias === undefined
  ? null
  : Number(dias);
    if (((km !== null && km !== undefined) && km < 0) ||
    ((fecha !== null && fecha !== undefined) && fecha < 0)) return 'Servicio pasado';
    
    if (((km !== null && km !== undefined) && km < 150) ||
        ((fecha !== null && fecha !== undefined) && fecha < 7)) return 'Urgente';

    if (((km !== null && km !== undefined) && km < 500) ||
        ((fecha !== null && fecha !== undefined) && fecha < 15)) return 'Proximo';

    if ((km === null || km === undefined) &&
        (fecha === null || fecha === undefined)) return 'Sin referencia';
    return 'Pendiente';
}

function createRules(pool) {
    async function transaction(work) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const result = await work(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally { connection.release(); }
    }

    async function validarKm(connection, vehiculo, value) {
        const km = kilometrajeValido(value);
        const [rows] = await connection.execute('SELECT MAX(kilometraje) AS ultimo FROM historial_kilometraje WHERE id_vehiculo = ?', [vehiculo.id_vehiculo]);
        const ultimo = Math.max(Number(vehiculo.kilometraje), Number(rows[0].ultimo || 0));
        if (km < ultimo) throw new Error(`El kilometraje no puede ser menor al ultimo registrado (${ultimo} km).`);
        return km;
    }

    async function historial(connection, idVehiculo, idOrden, km, origen) {
        await connection.execute(`INSERT INTO historial_kilometraje
            (id_vehiculo, id_orden, fecha_registro, kilometraje, origen) VALUES (?, ?, NOW(), ?, ?)`,
        [idVehiculo, idOrden, km, origen]);
        await connection.execute('UPDATE vehiculos SET kilometraje = ?, fecha_actualizacion = NOW() WHERE id_vehiculo = ?', [km, idVehiculo]);
    }

    async function cliente(connection, vehiculo, anterior) {
        const id = anterior?.id_cliente || Number(vehiculo.idCliente);
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error('Registra primero el cliente y abre el vehiculo desde su ficha.');
        }
        if (anterior?.id_cliente && vehiculo.idCliente && Number(vehiculo.idCliente) !== anterior.id_cliente) {
            throw new Error('No se puede cambiar el cliente vinculado desde este formulario.');
        }
        const [rows] = await connection.execute('SELECT id_cliente, nombre FROM clientes WHERE id_cliente = ?', [id]);
        if (!rows.length) throw new Error('El cliente vinculado no existe.');
        const propietario = typeof vehiculo.propietario === 'string' ? vehiculo.propietario.trim() : '';
        if (!propietario || propietario.length > 150) {
            throw new Error('Indica el propietario del vehiculo (maximo 150 caracteres).');
        }
        vehiculo.propietario = propietario;
        vehiculo.cliente = rows[0].nombre;
        return id;
    }

    async function guardarVehiculo(id, value, save) {
        return transaction(async (connection) => {
            const vehiculo = { ...value };
            let anterior = null;
            if (id) {
                const [rows] = await connection.execute('SELECT v.*, c.nombre AS cliente FROM vehiculos v LEFT JOIN clientes c ON c.id_cliente = v.id_cliente WHERE v.id_vehiculo = ? FOR UPDATE', [id]);
                anterior = rows[0];
                if (!anterior) throw new Error('El vehiculo no existe.');
            }
            vehiculo.kilometraje = anterior ? await validarKm(connection, anterior, vehiculo.kilometraje) : kilometrajeValido(vehiculo.kilometraje);
            const idCliente = await cliente(connection, vehiculo, anterior);
            const nivel = vehiculo.nivelUso || anterior?.nivel_uso || 'Normal';
            if (!['Bajo', 'Normal', 'Alto'].includes(nivel)) throw new Error('Nivel de uso invalido.');
            const result = await save(connection, vehiculo);
            const idVehiculo = id || result.id;
            await connection.execute('UPDATE vehiculos SET id_cliente = ?, nivel_uso = ? WHERE id_vehiculo = ?', [idCliente, nivel, idVehiculo]);
            if (!anterior || Number(anterior.kilometraje) !== vehiculo.kilometraje) {
                await historial(connection, idVehiculo, null, vehiculo.kilometraje, anterior ? 'Actualizacion' : 'Registro de vehiculo');
            }
            return { ...result, propietario: vehiculo.propietario, cliente: vehiculo.cliente, idCliente, nivelUso: nivel };
        });
    }

    async function actualizarKilometraje(id, value) {
        if (!Number.isInteger(id) || id <= 0) throw new Error('Vehiculo invalido.');
        return transaction(async connection => {
            const [rows] = await connection.execute('SELECT * FROM vehiculos WHERE id_vehiculo = ? FOR UPDATE', [id]);
            if (!rows.length) throw new Error('El vehiculo ya no existe.');
            const km = await validarKm(connection, rows[0], value);
            if (Number(rows[0].kilometraje) !== km) await historial(connection, id, null, km, 'Actualizacion');
            return {id, kilometraje: km};
        });
    }

    async function prepararOrden(connection, orden, id = null) {
        let anterior = null;
        if (id) {
            const [rows] = await connection.execute('SELECT * FROM ordenes_trabajo WHERE id_orden = ? FOR UPDATE', [id]);
            anterior = rows[0];
            if (!anterior) throw new Error('La orden no existe.');
        }
        if (!['Abierta', 'En proceso', 'Finalizada'].includes(orden.estado || 'Abierta')) throw new Error('Estado de orden invalido.');
        if (anterior?.estado === 'Finalizada' && orden.estado !== 'Finalizada') throw new Error('Una orden finalizada no puede reabrirse.');
        const idVehiculo = anterior?.id_vehiculo || orden.idVehiculo;
        const [rows] = idVehiculo
            ? await connection.execute('SELECT * FROM vehiculos WHERE id_vehiculo = ? FOR UPDATE', [idVehiculo])
            : await connection.execute('SELECT * FROM vehiculos WHERE placa = ? FOR UPDATE', [orden.placa]);
        const vehiculo = rows[0];
        if (!vehiculo) throw new Error('Registra o selecciona el vehiculo antes de guardar la orden.');
        if (anterior && (orden.placa !== anterior.placa || (orden.idVehiculo && Number(orden.idVehiculo) !== Number(vehiculo.id_vehiculo)))) throw new Error('No se puede cambiar el vehiculo de una orden existente.');
        orden.kilometraje = kilometrajeValido(orden.kilometraje);
        const [historia] = id ? await connection.execute('SELECT id_historial_kilometraje FROM historial_kilometraje WHERE id_orden = ? LIMIT 1', [id]) : [[]];
        const nuevoKm = !anterior || !historia.length || Number(anterior.kilometraje) !== orden.kilometraje;
        if (nuevoKm) await validarKm(connection, vehiculo, orden.kilometraje);
        if (anterior?.estado === 'Finalizada' && (Number(anterior.kilometraje) !== orden.kilometraje || anterior.fecha_salida !== (orden.fechaSalida || null))) throw new Error('No se puede modificar la fecha o kilometraje de un servicio finalizado.');
        // Se guardan los datos que tenia el vehiculo al recibir la atencion.
        orden.placa = anterior?.placa || vehiculo.placa;
        orden.vehiculo = anterior?.vehiculo ?? vehiculo.modelo;
        orden.marca = anterior?.marca ?? vehiculo.marca;
        orden.tipoVehiculo = anterior?.tipo_vehiculo ?? vehiculo.tipo;
        if (anterior) {
            orden.piloto = anterior.piloto;
        } else {
            const [clientes] = await connection.execute('SELECT nombre FROM clientes WHERE id_cliente = ?', [vehiculo.id_cliente]);
            orden.piloto = clientes[0]?.nombre ?? null;
        }
        const idMecanico = orden.idMecanico === null || orden.idMecanico === undefined ? anterior?.id_mecanico : Number(orden.idMecanico);
        if (idMecanico !== null && idMecanico !== undefined) {
            if (!Number.isInteger(Number(idMecanico)) || Number(idMecanico) <= 0) throw new Error('Selecciona un mecanico valido.');
            const [mecanicos] = await connection.execute('SELECT nombre FROM mecanicos WHERE id_mecanico = ?', [idMecanico]);
            if (!mecanicos.length) throw new Error('El mecanico seleccionado ya no existe.');
            orden.mecanico = anterior?.id_mecanico === Number(idMecanico) ? anterior.mecanico : mecanicos[0].nombre;
        }
        orden.idMecanico = idMecanico ?? null;
        return { vehiculo, nuevoKm, anterior };
    }

    async function completarOrden(connection, id, orden, contexto) {
        const { vehiculo, nuevoKm, anterior } = contexto;
        await connection.execute('UPDATE ordenes_trabajo SET id_mecanico = ? WHERE id_orden = ?', [orden.idMecanico, id]);
        await connection.execute('UPDATE ordenes_trabajo SET id_vehiculo = ? WHERE id_orden = ?', [vehiculo.id_vehiculo, id]);
        if (nuevoKm) await historial(connection, vehiculo.id_vehiculo, id, orden.kilometraje, anterior ? 'Actualizacion' : 'Ingreso a taller');
        if (orden.servicios !== undefined) {
            if (!Array.isArray(orden.servicios)) throw new Error('Seleccion de servicios invalida.');
            const ids = [...new Set(orden.servicios.map(Number))];
            const [actuales] = await connection.execute('SELECT * FROM detalle_servicio WHERE id_orden = ? FOR UPDATE', [id]);
            if (actuales.some(d => d.estado_mantenimiento === 'Realizado' && !ids.includes(d.id_servicio))) throw new Error('No se pueden quitar servicios ya realizados.');
            for (const detalle of actuales) {
                if (!ids.includes(detalle.id_servicio) && detalle.estado_mantenimiento === 'Pendiente') await connection.execute("UPDATE detalle_servicio SET estado_mantenimiento = 'Cancelado' WHERE id_detalle_servicio = ?", [detalle.id_detalle_servicio]);
            }
            for (const idServicio of ids) {
                if (!Number.isInteger(idServicio) || idServicio <= 0) throw new Error('Servicio invalido.');
                const existente = actuales.find(d => d.id_servicio === idServicio);
                if (existente?.estado_mantenimiento === 'Realizado') continue;
                const [servicios] = await connection.execute("SELECT * FROM servicios WHERE id_servicio = ? AND estado = 'Activo'", [idServicio]);
                const servicio = servicios[0];
                if (!servicio) throw new Error('El servicio seleccionado no esta activo.');
                const realizado = orden.estado === 'Finalizada';
                if (realizado && !orden.fechaSalida) throw new Error('Indica la fecha de salida para finalizar los servicios.');
                const fecha = realizado && servicio.tipo === 'Preventivo' ? proximaFecha(orden.fechaSalida, servicio.intervalo_dias_normal, vehiculo.nivel_uso) : null;
                if (realizado && servicio.tipo === 'Preventivo' && !fecha) throw new Error('El servicio preventivo necesita un intervalo de dias en el catalogo.');
                const valores = [realizado ? orden.fechaSalida : null, orden.kilometraje, orden.trabajos || null, vehiculo.nivel_uso, fecha, realizado ? 'Realizado' : 'Pendiente'];
                if (existente) await connection.execute(`UPDATE detalle_servicio SET fecha_realizado = ?, kilometraje_servicio = ?, trabajo_realizado = ?, nivel_uso = ?, fecha_proximo_servicio = ?, estado_mantenimiento = ? WHERE id_detalle_servicio = ?`, [...valores, existente.id_detalle_servicio]);
                else await connection.execute(`INSERT INTO detalle_servicio (fecha_realizado, kilometraje_servicio, trabajo_realizado, nivel_uso, fecha_proximo_servicio, estado_mantenimiento, id_orden, id_servicio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [...valores, id, idServicio]);
            }
        }
        // Al finalizar tambien se actualizan los servicios que estaban pendientes.
        if (orden.estado === 'Finalizada' && orden.servicios === undefined) {
            const [detalles] = await connection.execute("SELECT id_servicio FROM detalle_servicio WHERE id_orden = ? AND estado_mantenimiento <> 'Cancelado'", [id]);
            await completarOrden(connection, id, { ...orden, servicios: detalles.map(d => d.id_servicio) }, { ...contexto, nuevoKm: false });
        }
    }

    async function generarRecordatorios() {
        await pool.query(`INSERT INTO recordatorios (id_detalle_servicio, tipo, mensaje, canal, estado, fecha_generacion)
            SELECT a.id_detalle_servicio, IF(a.estado_alerta = 'Vencido', 'Servicio vencido', 'Proximo servicio'),
                CONCAT(a.placa, ': ', a.servicio, ' - ', a.fecha_proximo_servicio), 'Interno', 'Generado', NOW()
            FROM vw_mantenimientos_alerta a WHERE a.estado_alerta IN ('Proximo', 'Vencido')
            ON DUPLICATE KEY UPDATE id_recordatorio = id_recordatorio`);
    }

    async function dashboard() {
        await generarRecordatorios();
        const [counts] = await pool.query(`SELECT
            (SELECT COUNT(*) FROM vehiculos) AS vehiculos,
            (SELECT COUNT(*) FROM vw_mantenimientos_alerta WHERE estado_alerta = 'Proximo') AS proximos,
            (SELECT COUNT(*) FROM vw_mantenimientos_alerta WHERE estado_alerta = 'Vencido') AS vencidos,
            (SELECT COUNT(DISTINCT id_vehiculo) FROM ordenes_trabajo WHERE estado = 'Finalizada') AS atendidos,
            (SELECT COUNT(*) FROM ordenes_trabajo WHERE estado = 'En proceso') AS enProceso`);
        const [servicios] = await pool.query(`SELECT a.*, v.modelo AS vehiculo,
            CASE WHEN s.intervalo_km_referencial > 0 THEN ds.kilometraje_servicio + s.intervalo_km_referencial ELSE NULL END AS kilometraje_proximo,
            GREATEST(IFNULL(v.kilometraje,0), IFNULL((SELECT MAX(h.kilometraje) FROM historial_kilometraje h WHERE h.id_vehiculo = v.id_vehiculo),0),
                IFNULL((SELECT MAX(o.kilometraje) FROM ordenes_trabajo o WHERE o.id_vehiculo = v.id_vehiculo OR (o.id_vehiculo IS NULL AND o.placa = v.placa)),0)) AS kilometraje_actual
            FROM vw_mantenimientos_alerta a
            JOIN vehiculos v ON v.id_vehiculo = a.id_vehiculo
            JOIN detalle_servicio ds ON ds.id_detalle_servicio = a.id_detalle_servicio
            JOIN servicios s ON s.id_servicio = ds.id_servicio
            ORDER BY a.fecha_proximo_servicio, a.id_detalle_servicio`);
        const hoy = new Date();
        for (const servicio of servicios) {
            servicio.dias_restantes = diasParaServicio(servicio.fecha_proximo_servicio, hoy);
            servicio.kilometros_restantes = (servicio.kilometraje_proximo === null || servicio.kilometraje_proximo === undefined) ? null : Math.round((Number(servicio.kilometraje_proximo) - Number(servicio.kilometraje_actual)) * 100) / 100;
            servicio.estado_alerta = estadoMantenimiento(servicio.kilometros_restantes, servicio.dias_restantes);
        }
        return { ...counts[0], proximos: servicios.filter(s => ['Proximo', 'Urgente'].includes(s.estado_alerta)).length, vencidos: servicios.filter(s => s.estado_alerta === 'Servicio pasado').length, servicios };
    }
    return { actualizarKilometraje, guardarVehiculo, prepararOrden, completarOrden, generarRecordatorios, dashboard };
}
module.exports = { createRules, kilometrajeValido, proximaFecha, diasParaServicio, estadoMantenimiento };
