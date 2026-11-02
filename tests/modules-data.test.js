const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const tick = () => new Promise(resolve => setImmediate(resolve));
function setup(name) {
    class Element {
        constructor(id = '') {
            this.value = id.startsWith('filtro') ? 'todos' : '';
            this.handlers = {}; this.dataset = {}; this.options = []; this.children = [];
            this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
        }
        addEventListener(name, callback) { this.handlers[name] = callback; }
        querySelectorAll() { return []; }
        querySelector() { return this.cell || (this.cell = new Element()); }
        setAttribute() {} removeAttribute() {} focus() {} reset() {} reportValidity() { return true; }
        replaceChildren(...children) { this.children = children; this.options = children; }
        append(child) { this.options.push(child); }
    }
    const nodes = new Map();
    const html = fs.readFileSync(path.join(__dirname, '../src/views', name + '.html'), 'utf8');
    for (const match of html.matchAll(/\bid="([^"]+)"/g)) nodes.set(match[1], new Element(match[1]));
    const state = { fail: false, data: [] };
    const list = async () => { if (state.fail) throw Error('Sin conexion'); return state.data; };
    const api = { mecanicos: { list }, vehiculos: { list }, pilotos: { list }, ordenes: { list }, servicios: { list }, repuestos: { list, historial: list, ultimosIngresos: list } };
    const alerts = [];
    const document = { hidden: false, getElementById(id) { assert(nodes.has(id), 'ID inexistente: ' + id); return nodes.get(id); }, querySelectorAll: () => [], createElement: () => new Element(), addEventListener() {} };
    const ctx = vm.createContext({ document, window: { api, location: { search: '' }, ui: { alert: async m => alerts.push(m), confirm: async () => false }, addEventListener() {} }, URLSearchParams, setInterval() {}, alert: m => alerts.push(m), console });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/scripts/modules', (name === 'pilotos' ? 'clientes' : name) + '.js'), 'utf8'), ctx);
    return { ctx, nodes, state, alerts };
}
for (const [name, load, indicator, table, empty] of [
    ['vehiculos', 'cargarVehiculos', 'totalVehiculos', 'tablaVehiculos', 'No hay vehiculos'],
    ['pilotos', 'cargarPilotos', 'totalPilotos', 'tablaPilotos', 'No hay clientes'],
    ['ordenes-trabajo', 'cargarDatosOrdenes', 'totalOrdenesTrabajo', 'tablaOrdenesTrabajo', 'No hay ordenes'],
    ['repuestos', 'cargarRepuestos', 'totalRepuestos', 'tablaRepuestos', 'No hay repuestos']
]) {
    test(name + ': consulta vacia, fallo y recuperacion sin datos ficticios', async () => {
        const page = setup(name); await tick();
        assert.equal(page.alerts.length, 0);
        assert.equal(Number(page.nodes.get(indicator).innerText), 0);
        assert(page.nodes.get(table).innerHTML.includes(empty));
        page.state.fail = true;
        await vm.runInContext(load + '()', page.ctx);
        assert.equal(page.nodes.get(indicator).innerText, '--');
        assert(page.nodes.get(table).cell.textContent.includes('No se pudieron'));
        page.state.fail = false;
        await vm.runInContext(load + '()', page.ctx);
        assert.equal(Number(page.nodes.get(indicator).innerText), 0);
        assert(page.nodes.get(table).innerHTML.includes(empty));
    });
}
test('Consulta de cliente oculta agregar vehiculo; edicion lo conserva', async () => {
    const page = setup('pilotos'); await tick();
    vm.runInContext('setRegistroPilotoSoloLectura(true)', page.ctx);
    assert.equal(page.nodes.get('btnAgregarVehiculoCliente').hidden, true);
    vm.runInContext('setRegistroPilotoSoloLectura(false)', page.ctx);
    assert.equal(page.nodes.get('btnAgregarVehiculoCliente').hidden, false);
});
test('Ordenes usa existencia actual de inventario y no sustituye referencias perdidas por cero', async () => {
    const page = setup('ordenes-trabajo'); await tick();
    vm.runInContext('inventarioRepuestos.push({id: 7, existencia: 23});', page.ctx);
    assert.equal(vm.runInContext('normalizarRepuestosOrden([{id: 999, idRepuesto: 7, cantidad: 2}])[0].existencia', page.ctx), 23);
    assert.equal(vm.runInContext('normalizarRepuestosOrden([{id: 999, idRepuesto: null, cantidad: 2}])[0].existencia', page.ctx), null);
    assert.equal(vm.runInContext('normalizarRepuestosOrden([{id: 999, idRepuesto: null, cantidad: 2}])[0].idRepuesto', page.ctx), null);
});

test('Estado solo visible en edicion; cancelar no escribe y confirmar actualiza el indicador', async () => {
    const page = setup('vehiculos'); await tick();
    vm.runInContext("vehiculos = [{id: 12, placa: 'P-123', estado: 'Activo', tipo: 'Sedan', kilometraje: 0}]; vehiculoSeleccionadoId = 12; modoRegistroVehiculo = 'vista'; actualizarControlEstadoVehiculo();", page.ctx);
    assert.equal(page.nodes.get('vehiculoEstadoEdicion').hidden, true);
    vm.runInContext("modoRegistroVehiculo = 'nuevo'; actualizarControlEstadoVehiculo();", page.ctx);
    assert.equal(page.nodes.get('vehiculoEstadoEdicion').hidden, true);
    vm.runInContext("modoRegistroVehiculo = 'edicion'; actualizarControlEstadoVehiculo();", page.ctx);
    assert.equal(page.nodes.get('vehiculoEstadoEdicion').hidden, false);
    let writes = 0;
    page.ctx.window.api.vehiculos.setEstado = async (id, estado) => { writes++; return {id, estado}; };
    await page.nodes.get('btnCambiarEstadoVehiculo').handlers.click();
    assert.equal(writes, 0);
    page.nodes.get('vehiculoModelo').value = 'Borrador';
    page.ctx.window.ui.confirm = async (message, options) => { assert.equal(options.tone, 'danger'); return true; };
    await page.nodes.get('btnCambiarEstadoVehiculo').handlers.click();
    assert.equal(writes, 1);
    assert.equal(page.nodes.get('vehiculosInactivos').innerText, 1);
    assert.equal(page.nodes.get('btnCambiarEstadoVehiculo').textContent, 'Activar');
    assert.equal(page.nodes.get('vehiculoModelo').value, 'Borrador');
    assert(page.nodes.get('btnCambiarEstadoVehiculo').className.includes('is-success'));
    page.ctx.window.ui.confirm = async (message, options) => { assert.equal(options.tone, 'success'); return true; };
    await page.nodes.get('btnCambiarEstadoVehiculo').handlers.click();
    assert.equal(page.nodes.get('btnCambiarEstadoVehiculo').textContent, 'Desactivar');
    assert(page.nodes.get('btnCambiarEstadoVehiculo').className.includes('is-danger'));
});

test('Busqueda de vehiculos alterna placa, nombre y modelo sin perder espacios', async () => {
    const page = setup('vehiculos'); await tick();
    for (const [input, expected] of [['p', 'P-'], ['P-5', 'P-5'], ['p5', 'P-5'], ['S-S', 'SS'], ['H-ernan Cortes', 'Hernan Cortes'], ['2026', '2026'], ['', '']]) {
        page.ctx.searchInput = input;
        assert.equal(vm.runInContext('formatVehicleSearchInput(searchInput)', page.ctx), expected);
    }
    assert.equal(vm.runInContext("formatVehicleSearchInput('P', true)", page.ctx), 'P');
    vm.runInContext("vehiculos = [{id: 1, placa: 'P-500HJK', tipo: 'Sedan', estado: 'Activo', modelo: '2026', cliente: 'Hernan Cortes'}, {id: 2, placa: 'M-919GHJ', tipo: 'Moto', estado: 'Activo', modelo: '2020', cliente: 'Ana Lopez'}];", page.ctx);
    const field = page.nodes.get('buscarVehiculo');
    for (const query of ['P-5', 'H-ernan Cortes', '2026']) {
        field.value = query;
        field.handlers.input({ inputType: 'insertText' });
        assert.equal(vm.runInContext('getVehiculosFiltrados().length', page.ctx), 1);
        assert.equal(vm.runInContext('getVehiculosFiltrados()[0].id', page.ctx), 1);
    }
    field.value = ''; field.handlers.input({ inputType: 'deleteContentBackward' });
    assert.equal(vm.runInContext('getVehiculosFiltrados().length', page.ctx), 2);
    assert.equal(vm.runInContext("formatVehiclePlateInput('p500')", page.ctx), 'P-500');
});


test('Indicadores de ordenes filtran mes y anio de creacion, conservando inventario actual', async () => {
    const page = setup('ordenes-trabajo'); await tick();
    const mes = page.nodes.get('mesIndicadoresOrdenes');
    const hoy = new Date();
    assert.equal(mes.value, `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`);
    vm.runInContext(`ordenesTrabajo.push(
        {fechaCreacion: '2026-09-01 10:00:00', fechaEntrada: '2026-08-30', estado: 'Abierta'},
        {fechaCreacion: '2026-09-30 23:59:59', estado: 'En proceso'},
        {fechaCreacion: '2026-08-31 23:59:59', estado: 'Finalizada'},
        {fechaCreacion: '2025-09-01 00:00:00', estado: 'Finalizada'}
    ); inventarioRepuestos.push({existencia: 5}, {existencia: '7'}, {existencia: 0});`, page.ctx);
    for (const [value, total, abiertas, proceso, finalizadas] of [
        ['2026-09', 2, 1, 1, 0], ['2026-08', 1, 0, 0, 1],
        ['2025-09', 1, 0, 0, 1], ['2026-10', 0, 0, 0, 0]
    ]) {
        mes.value = value; mes.handlers.change();
        for (const [id, expected] of [['totalOrdenesTrabajo', total], ['ordenesAbiertas', abiertas], ['ordenesProceso', proceso], ['ordenesFinalizadas', finalizadas], ['totalRepuestosOrdenes', 12]]) {
            assert.equal(Number(page.nodes.get(id).innerText), expected, id);
        }
    }
    mes.value = ''; mes.handlers.change();
    assert.match(mes.value, /^\d{4}-\d{2}$/);
});


test('Busqueda de ordenes: placa, cliente, numero y mecanico con formato automatico', async () => {
    const page = setup('ordenes-trabajo'); await tick();
    const field = page.nodes.get('buscarOrdenTrabajo');
    vm.runInContext(`ordenesTrabajo.push(
        {numero: 2026, placa: 'P-500HJK', piloto: 'Hernan Cortes', mecanico: 'Jose Lopez', estado: 'Abierta'},
        {numero: 99, placa: 'M-919GHJ', piloto: 'Ana Perez', mecanico: 'Luis Gomez', estado: 'Finalizada'}
    );`, page.ctx);
    for (const [input, expected] of [['p', 'P-'], ['P-5', 'P-5'], ['p5', 'P-5'], ['h-e', 'HE'], ['hernan cortes', 'HERNAN CORTES'], ['jose lopez', 'JOSE LOPEZ'], ['2026', '2026']]) {
        field.value = input;
        field.handlers.input({inputType: 'insertText'});
        assert.equal(field.value, expected);
        assert.equal(vm.runInContext('getOrdenesFiltradas().length', page.ctx), input === 'p' ? 2 : 1);
        assert.equal(vm.runInContext('getOrdenesFiltradas()[0].numero', page.ctx), 2026);
    }
    field.value = 'P'; field.handlers.input({inputType: 'deleteContentBackward'});
    assert.equal(field.value, 'P');
    field.value = ''; field.handlers.input({inputType: 'deleteContentBackward'});
    assert.equal(vm.runInContext('getOrdenesFiltradas().length', page.ctx), 2);
    page.nodes.get('filtroEstadoOrdenTrabajo').value = 'Finalizada';
    assert.equal(vm.runInContext('getOrdenesFiltradas()[0].numero', page.ctx), 99);
});


test('Placa autocompleta vehiculo y cliente sin cambiar los campos manuales', async () => {
    const page = setup('ordenes-trabajo'); await tick();
    vm.runInContext("catalogoVehiculos.push(mapVehiculoCatalogo({placa:'P-123ABC', modelo:'2026', marca:'Toyota', cliente:'Ana Perez', tipo:'Sedan', kilometraje:100})); renderOrdenDatalists();", page.ctx);
    assert(page.nodes.get('ordenPlacasList').innerHTML.includes('P-123ABC'));
    for (const [id, value] of [['ordenMecanico', 'Luis'], ['ordenKilometraje', '120'], ['ordenProximoServicio', 'Revision manual']]) page.nodes.get(id).value = value;
    page.nodes.get('ordenPlaca').value = 'p123abc';
    page.nodes.get('ordenPlaca').handlers.input();
    for (const [id, expected] of [['ordenPlaca','P-123ABC'], ['ordenVehiculo','2026'], ['ordenMarca','Toyota'], ['ordenPiloto','Ana Perez'], ['ordenTipoVehiculo','Sedan'], ['ordenMecanico','Luis'], ['ordenKilometraje','120'], ['ordenProximoServicio','Revision manual']]) assert.equal(page.nodes.get(id).value, expected);
    page.nodes.get('ordenPlaca').value = '';
    page.nodes.get('ordenPlaca').handlers.change();
    assert.equal(page.nodes.get('ordenPiloto').value, '');
    assert.equal(page.nodes.get('ordenKilometraje').value, '120');
    assert.equal(page.nodes.has('ordenDepartamento'), false);
});


test('Campos automaticos bloqueados y casilla Pinchazo disponible al editar', async () => {
    const page = setup('ordenes-trabajo'); await tick();
    const html = fs.readFileSync(path.join(__dirname, '../src/views/ordenes-trabajo.html'), 'utf8');
    for (const id of ['ordenVehiculo', 'ordenMarca', 'ordenPiloto']) assert(new RegExp('id="' + id + '"[^>]*readonly').test(html));
    for (const soloLectura of [true, false]) {
        vm.runInContext('setOrdenSoloLectura(' + soloLectura + ')', page.ctx);
        assert.equal(page.nodes.get('ordenTipoVehiculo').disabled, true);
    }
    vm.runInContext("setOrdenChecked('ordenManoPinchazo', true)", page.ctx);
    assert.equal(page.nodes.get('ordenManoPinchazo').checked, true);
});



test('Seleccion unica dentro del campo y servicio por cualquier palabra', async () => {
    const page = setup('ordenes-trabajo'); await tick();
    const tipo = page.nodes.get('ordenTipoTrabajoBusqueda');
    tipo.value = 'Pinchazo'; tipo.handlers.change();
    assert.equal(page.nodes.get('ordenManoPinchazo').checked, true);
    tipo.value = 'Enderezado y Pintura'; tipo.handlers.change();
    assert.equal(page.nodes.get('ordenManoPinchazo').checked, false);
    assert.equal(tipo.value, 'Enderezado y Pintura');
    const options = [{value:'7',textContent:'Cambio de aceite',selected:false}, {value:'8',textContent:'Revision de frenos',selected:false}];
    page.nodes.get('ordenServicios').options = options;
    const input = page.nodes.get('ordenServicioBusqueda');
    input.value = 'aceite'; input.handlers.input();
    assert(page.nodes.get('ordenServiciosSugeridos').innerHTML.includes('Cambio de aceite'));
    assert(!page.nodes.get('ordenServiciosSugeridos').innerHTML.includes('frenos'));
    input.value = 'Cambio de aceite'; input.handlers.change();
    assert.equal(options[0].selected, true); assert.equal(input.value,'Cambio de aceite');
    input.value = 'Revision de frenos'; input.handlers.change();
    assert.equal(options[0].selected, false); assert.equal(options[1].selected, true);
    assert.equal(page.nodes.has('ordenTiposSeleccionados'), false);
});


test('Acciones de estado cancelan o avanzan sin perder los datos de la orden', async () => {
    const page = setup('ordenes-trabajo'); await tick();
    let orden = {id:42, numero:'42', estado:'Abierta', trabajos:'Detalle conservado', kilometraje:200, servicios:[7]};
    let writes = 0;
    page.ctx.window.api.ordenes.list = async () => [orden];
    page.ctx.window.api.ordenes.update = async (id, value) => { assert.equal(id,42); writes++; orden=value; };
    page.ctx.botonPrueba = {dataset:{id:'42'},disabled:false};
    await vm.runInContext('avanzarEstadoOrden(botonPrueba)',page.ctx);
    assert.equal(writes,0);
    page.ctx.window.ui.confirm = async () => true;
    await vm.runInContext('avanzarEstadoOrden(botonPrueba)',page.ctx);
    assert.equal(orden.estado,'En proceso');
    await vm.runInContext('avanzarEstadoOrden(botonPrueba)',page.ctx);
    assert.equal(orden.estado,'Finalizada');
    assert.match(orden.fechaSalida,/^\d{4}-\d{2}-\d{2}$/);
    assert.equal(orden.trabajos,'Detalle conservado');
    assert.equal(orden.kilometraje,200);
    await vm.runInContext('avanzarEstadoOrden(botonPrueba)',page.ctx);
    assert.equal(writes,2);
});
