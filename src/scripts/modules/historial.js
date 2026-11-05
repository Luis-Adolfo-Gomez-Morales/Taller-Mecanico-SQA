const tablaHistorial = document.getElementById('historialTabla');
const resumenHistorial = document.getElementById('historialResumen');
let registrosHistorial = [], paginaHistorial = 0;
const normalizarHistorial = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function filtrarHistorial(rows, busqueda, desde, hasta) {
    return rows.filter(row =>
        (!desde || String(row.fecha).slice(0,10) >= desde) && (!hasta || String(row.fecha).slice(0,10) <= hasta) &&
        normalizarHistorial([row.placa, row.vehiculo, row.orden, row.servicios, row.mecanico, row.trabajos, row.observaciones, row.evento].join(' ')).includes(normalizarHistorial(busqueda.trim())));
}
function renderHistorial() {
    const rows = filtrarHistorial(registrosHistorial, ...['historialBuscar','historialDesde','historialHasta'].map(id => document.getElementById(id).value));
    const paginas = Math.max(1, Math.ceil(rows.length / 50)); paginaHistorial = Math.min(paginaHistorial, paginas - 1);
    tablaHistorial.replaceChildren(...rows.slice(paginaHistorial*50, (paginaHistorial+1)*50).map(row => {
        const tr = document.createElement('tr');
        for (const key of ['fecha','placa','vehiculo','orden','kilometraje','servicios','mecanico','trabajos','observaciones','estado','evento']) { const td = document.createElement('td'); td.textContent = row[key] ?? ''; tr.append(td); }
        return tr;
    }));
    resumenHistorial.textContent = rows.length ? `${rows.length} registros encontrados` : 'No hay registros con estos filtros.';
    document.getElementById('historialPagina').textContent = `${paginaHistorial + 1} / ${paginas}`;
    document.getElementById('historialAnterior').disabled = paginaHistorial === 0;
    document.getElementById('historialSiguiente').disabled = paginaHistorial >= paginas - 1;
}
async function cargarHistorial() {
    const boton = document.getElementById('historialActualizar'); boton.disabled = true;
    resumenHistorial.textContent = 'Cargando historial...';
    try { registrosHistorial = await window.api.historial.list(); paginaHistorial = 0; renderHistorial(); }
    catch (error) { registrosHistorial = []; renderHistorial(); resumenHistorial.textContent = 'No se pudo cargar el historial.'; await window.ui.alert(error.message); }
    finally { boton.disabled = false; }
}
for (const id of ['historialBuscar','historialDesde','historialHasta']) document.getElementById(id).addEventListener('input', () => { paginaHistorial = 0; renderHistorial(); });
document.getElementById('historialAnterior').addEventListener('click', () => { paginaHistorial--; renderHistorial(); });
document.getElementById('historialSiguiente').addEventListener('click', () => { paginaHistorial++; renderHistorial(); });
document.getElementById('historialActualizar').addEventListener('click', cargarHistorial);
cargarHistorial().catch(error => console.error('No se pudo completar la carga inicial:', error));
