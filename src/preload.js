const { contextBridge, ipcRenderer } = require('electron');

function invoke(channel, ...args) {
    return ipcRenderer.invoke(channel, ...args);
}

contextBridge.exposeInMainWorld('api', {
    mecanicos: { list: () => invoke('mecanicos:list'), save: (id, value) => invoke('mecanicos:save', id, value) },
    historial: { list: () => invoke('historial:list') },
    dashboard: { get: () => invoke('dashboard:get') },
    servicios: { list: () => invoke('servicios:list') },
    auth: {
        login: (usuario, password) => invoke('auth:login', usuario, password)
    },
    vehiculos: {
        kilometraje: (id, km) => invoke('vehiculos:kilometraje', id, km),
        setEstado: (id, estado) => invoke('vehiculos:estado', id, estado),
        list: () => invoke('vehiculos:list'),
        create: (vehiculo) => invoke('vehiculos:create', vehiculo),
        update: (id, vehiculo) => invoke('vehiculos:update', id, vehiculo),
        remove: (id) => invoke('vehiculos:delete', id)
    },
    pilotos: {
        list: () => invoke('pilotos:list'),
        create: (piloto) => invoke('pilotos:create', piloto),
        update: (id, piloto) => invoke('pilotos:update', id, piloto),
        remove: (id) => invoke('pilotos:delete', id)
    },
    repuestos: {
        list: () => invoke('repuestos:list'),
        create: (repuesto) => invoke('repuestos:create', repuesto),
        movimiento: (movimiento) => invoke('repuestos:movimiento', movimiento),
        historial: () => invoke('repuestos:historial'),
        ultimosIngresos: () => invoke('repuestos:ultimos-ingresos')
    },
    ordenes: {
        list: () => invoke('ordenes:list'),
        create: (orden) => invoke('ordenes:create', orden),
        update: (id, orden) => invoke('ordenes:update', id, orden),
        remove: (id) => invoke('ordenes:delete', id)
    }
});
