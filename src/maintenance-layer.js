// Operaciones de servicios y avisos de mantenimiento.
// Estas funciones comparten los datos de vehiculos y ordenes.

function createMaintenanceLayer(pool, { listClientes, createCliente }) {
    // Se usan las mismas reglas del formulario de clientes.
    async function listPropietarios() {
        return listClientes();
    }

    async function createPropietario(propietario) {
        const cliente = await createCliente(propietario);
        return cliente.id;
    }

    async function listServicios() {
        const [rows] = await pool.query(`
            SELECT id_servicio, nombre, descripcion, tipo, intervalo_dias_normal,
                   intervalo_km_referencial, estado
            FROM servicios
            WHERE estado = 'Activo' OR id_servicio IN (SELECT id_servicio FROM detalle_servicio WHERE estado_mantenimiento <> 'Cancelado')
            ORDER BY nombre ASC
        `);
        return rows.map((row) => ({
            id: row.id_servicio,
            nombre: row.nombre,
            descripcion: row.descripcion,
            tipo: row.tipo,
            intervaloDiasNormal: row.intervalo_dias_normal,
            intervaloKmReferencial: row.intervalo_km_referencial,
            estado: row.estado
        }));
    }

    async function listAlertasMantenimiento() {
        const [rows] = await pool.query(`
            SELECT id_detalle_servicio, id_vehiculo, placa, propietario, servicio,
                   fecha_proximo_servicio, estado_alerta
            FROM vw_mantenimientos_alerta
            WHERE estado_alerta IN ('Proximo', 'Vencido')
            ORDER BY fecha_proximo_servicio ASC
        `);
        return rows.map((row) => ({
            idDetalleServicio: row.id_detalle_servicio,
            idVehiculo: row.id_vehiculo,
            placa: row.placa,
            propietario: row.propietario,
            servicio: row.servicio,
            fechaProximoServicio: row.fecha_proximo_servicio,
            estado: row.estado_alerta
        }));
    }

    return {
        listPropietarios,
        createPropietario,
        listServicios,
        listAlertasMantenimiento
    };
}

module.exports = { createMaintenanceLayer };
