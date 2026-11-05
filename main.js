const path = require('path');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const database = require('./src/database');

// Cada ventana conserva el usuario que inicio sesion.
const usuariosPorVentana = new WeakMap();

function registerDatabaseHandlers() {
    ipcMain.handle('mecanicos:list', () => database.listMecanicos());
    ipcMain.handle('mecanicos:save', (_event, id, value) => database.saveMecanico(id, value));
    ipcMain.handle('historial:list', () => database.listHistorial());
    ipcMain.handle('dashboard:get', () => database.dashboard());
    ipcMain.handle('servicios:list', () => database.listServicios());
    ipcMain.handle('auth:login', async (event, usuario, password) => {
        usuariosPorVentana.delete(event.sender);
        const user = await database.authenticateUser(usuario, password);
        if (user) usuariosPorVentana.set(event.sender, user.id);
        return user;
    });

    ipcMain.handle('vehiculos:estado', (event, id, estado) => {
        if (!usuariosPorVentana.has(event.sender)) throw new Error('Inicia sesion para cambiar el estado.');
        return database.setEstadoVehiculo(id, estado);
    });
    ipcMain.handle('vehiculos:kilometraje', (event, id, km) => {
        if (!usuariosPorVentana.has(event.sender)) throw new Error('Inicia sesion para actualizar el kilometraje.');
        return database.actualizarKilometraje(id, km);
    });
    ipcMain.handle('vehiculos:list', () => database.listVehiculos());
    ipcMain.handle('vehiculos:create', (event, vehiculo) => database.createVehiculo(vehiculo, usuariosPorVentana.get(event.sender)));
    ipcMain.handle('vehiculos:update', (event, id, vehiculo) => database.updateVehiculo(id, vehiculo));
    ipcMain.handle('vehiculos:delete', (event, id) => database.deleteVehiculo(id));

    ipcMain.handle('pilotos:list', () => database.listPilotos());
    ipcMain.handle('pilotos:create', (event, piloto) => database.createPiloto(piloto));
    ipcMain.handle('pilotos:update', (event, id, piloto) => database.updatePiloto(id, piloto));
    ipcMain.handle('pilotos:delete', (event, id) => database.deletePiloto(id));

    ipcMain.handle('repuestos:list', () => database.listRepuestos());
    ipcMain.handle('repuestos:create', (event, repuesto) => database.createRepuesto(repuesto));
    ipcMain.handle('repuestos:movimiento', (event, movimiento) => database.createRepuestoMovimiento(movimiento));
    ipcMain.handle('repuestos:historial', () => database.listRepuestoMovimientos());
    ipcMain.handle('repuestos:ultimos-ingresos', () => database.listUltimosIngresosRepuestos());

    ipcMain.handle('ordenes:list', () => database.listOrdenes());
    ipcMain.handle('ordenes:create', (event, orden) => database.createOrden(orden));
    ipcMain.handle('ordenes:update', (event, id, orden) => database.updateOrden(id, orden));
    ipcMain.handle('ordenes:delete', (event, id) => database.deleteOrden(id));
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 700,
        title: 'Taller Mecánico',
        webPreferences: {
            preload: path.join(__dirname, 'src', 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            spellcheck: true
        }
    });

    win.webContents.session.setSpellCheckerLanguages(['es']);
    win.webContents.on('context-menu', (_event, params) => {
        if (!params.isEditable) return;
        const template = params.dictionarySuggestions.map(word => ({ label: word, click: () => win.webContents.replaceMisspelling(word) }));
        if (params.misspelledWord) template.push({ label: 'Agregar al diccionario', click: () => win.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord) });
        if (template.length) template.push({ type: 'separator' });
        template.push({ role: 'cut', label: 'Cortar' }, { role: 'copy', label: 'Copiar' }, { role: 'paste', label: 'Pegar' }, { role: 'selectAll', label: 'Seleccionar todo' });
        Menu.buildFromTemplate(template).popup({ window: win });
    });
    win.loadFile('src/views/login.html').catch(error => console.error('No se pudo cargar el inicio de sesion:', error));
}

app.whenReady().then(async () => {
    Menu.setApplicationMenu(null);
    registerDatabaseHandlers();

    const actualizarRecordatorios = () => database.generarRecordatorios().catch(error => console.error('No se pudieron generar recordatorios:', error.message));
    await actualizarRecordatorios();
    const timer = setInterval(actualizarRecordatorios, 60 * 60 * 1000);
    timer.unref();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
}).catch(error => {
    console.error('No se pudo iniciar la aplicacion:', error);
    app.quit();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
