const botonesVista = Array.from(document.querySelectorAll('.inventory-action'));
const tablaRepuestos = document.getElementById('tablaRepuestos');
const tablaHistorialRepuestos = document.getElementById('tablaHistorialRepuestos');
const tablaExistenciaPanel = document.getElementById('tablaExistenciaPanel');
const tablaHistorialPanel = document.getElementById('tablaHistorialPanel');
const movimientoPanel = document.getElementById('movimientoPanel');
const movimientoEtiqueta = document.getElementById('movimientoEtiqueta');
const movimientoTitulo = document.getElementById('movimientoTitulo');
const formMovimientoRepuesto = document.getElementById('formMovimientoRepuesto');
const movimientoRepuesto = document.getElementById('movimientoRepuesto');
const movimientoCantidad = document.getElementById('movimientoCantidad');
const movimientoCosto = document.getElementById('movimientoCosto');
const movimientoReferencia = document.getElementById('movimientoReferencia');
const movimientoObservaciones = document.getElementById('movimientoObservaciones');
const repuestosMovimientoList = document.getElementById('repuestosMovimientoList');
const buscarRepuesto = document.getElementById('buscarRepuesto');
const totalRepuestos = document.getElementById('totalRepuestos');
const existenciaTotal = document.getElementById('existenciaTotal');
const bajoStock = document.getElementById('bajoStock');
const valorInventario = document.getElementById('valorInventario');
const ultimosIngresosList = document.getElementById('ultimosIngresosList');
const btnNuevoRepuesto = document.getElementById('btnNuevoRepuesto');
const modalRepuesto = document.getElementById('modalRepuesto');
const btnCerrarRepuesto = document.getElementById('btnCerrarRepuesto');
const formRepuesto = document.getElementById('formRepuesto');

let repuestos = [];
let historial = [];
let ultimosIngresos = [];
let tipoMovimiento = 'Ingreso';
let estadoCargaRepuestos = 'Cargando datos...';

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[character]));
}

function formatCurrency(value) {
    return `Q${Number(value || 0).toFixed(2)}`;
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-US', {
        maximumFractionDigits: 2
    });
}

function formatDateTime(value) {
    if (!value) {
        return 'Sin fecha';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value).replace('T', ' ').slice(0, 16);
    }

    return date.toLocaleString('es-GT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getRepuestoLabel(repuesto) {
    return `${repuesto.codigo} - ${repuesto.nombre}`;
}

function enableEditableDatalist(input) {
    input.addEventListener('focus', () => {
        if (input.disabled || !input.value) {
            return;
        }

        input.dataset.previousValue = input.value;
        input.value = '';
    });

    input.addEventListener('input', () => {
        input.dataset.previousValue = '';
    });

    input.addEventListener('blur', () => {
        if (!input.value && input.dataset.previousValue) {
            input.value = input.dataset.previousValue;
        }

        input.dataset.previousValue = '';
    });
}

function getRepuestoSeleccionado() {
    const value = movimientoRepuesto.value.trim().toLowerCase();

    return repuestos.find((repuesto) => (
        repuesto.codigo.toLowerCase() === value
        || repuesto.nombre.toLowerCase() === value
        || getRepuestoLabel(repuesto).toLowerCase() === value
    ));
}

function getRepuestosFiltrados() {
    const query = buscarRepuesto.value.trim().toLowerCase();

    return repuestos.filter((repuesto) => [
        repuesto.codigo,
        repuesto.nombre,
        repuesto.descripcion
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)));
}

function renderIndicadores() {
    if (estadoCargaRepuestos) { mostrarEstadoCargaRepuestos(); return; }
    totalRepuestos.innerText = repuestos.length;
    existenciaTotal.innerText = formatNumber(repuestos.reduce((total, repuesto) => total + Number(repuesto.existencia || 0), 0));
    bajoStock.innerText = repuestos.filter((repuesto) => Number(repuesto.existencia || 0) <= 5).length;
    valorInventario.innerText = formatCurrency(repuestos.reduce((total, repuesto) => (
        total + (Number(repuesto.existencia || 0) * Number(repuesto.costo || 0))
    ), 0));
}

function renderRepuestos() {
    if (estadoCargaRepuestos) { mostrarEstadoCargaRepuestos(); return; }
    const rows = getRepuestosFiltrados();

    tablaRepuestos.innerHTML = rows.map((repuesto) => `
        <tr>
            <td>${escapeHtml(repuesto.codigo)}</td>
            <td>${escapeHtml(repuesto.nombre)}</td>
            <td>${escapeHtml(repuesto.descripcion || 'Sin descripcion')}</td>
            <td><span class="stock-pill ${Number(repuesto.existencia || 0) <= 5 ? 'low' : 'ok'}">${formatNumber(repuesto.existencia)}</span></td>
            <td>${formatCurrency(repuesto.costo)}</td>
        </tr>
    `).join('');

    if (rows.length === 0) {
        tablaRepuestos.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">No hay repuestos con esos filtros.</td>
            </tr>
        `;
    }
}

function renderHistorial() {
    if (estadoCargaRepuestos) { tablaHistorialRepuestos.innerHTML = '<tr><td colspan="7" class="empty-row">Datos no disponibles.</td></tr>'; return; }
    tablaHistorialRepuestos.innerHTML = historial.map((movimiento) => `
        <tr>
            <td>${formatDateTime(movimiento.fecha)}</td>
            <td><span class="movement-pill ${movimiento.tipo === 'Ingreso' ? 'in' : 'out'}">${movimiento.tipo}</span></td>
            <td>${escapeHtml(movimiento.codigo)}</td>
            <td>${escapeHtml(movimiento.nombre)}</td>
            <td>${formatNumber(movimiento.cantidad)}</td>
            <td>${formatNumber(movimiento.existenciaAnterior)} -> ${formatNumber(movimiento.existenciaNueva)}</td>
            <td>${escapeHtml(movimiento.referencia || 'Sin referencia')}</td>
        </tr>
    `).join('');

    if (historial.length === 0) {
        tablaHistorialRepuestos.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">No hay movimientos registrados.</td>
            </tr>
        `;
    }
}

function renderUltimosIngresos() {
    if (estadoCargaRepuestos) { ultimosIngresosList.textContent = 'Datos no disponibles.'; return; }
    ultimosIngresosList.innerHTML = ultimosIngresos.map((movimiento) => `
        <article class="ingreso-item">
            <div>
                <strong>${escapeHtml(movimiento.codigo)}</strong>
                <span>${escapeHtml(movimiento.nombre)}</span>
            </div>
            <small>${formatNumber(movimiento.cantidad)} uds</small>
        </article>
    `).join('');

    if (ultimosIngresos.length === 0) {
        ultimosIngresosList.innerHTML = '<p class="empty-note">Sin ingresos registrados.</p>';
    }
}

function renderRepuestosList() {
    repuestosMovimientoList.innerHTML = repuestos.map((repuesto) => (
        `<option value="${escapeHtml(getRepuestoLabel(repuesto))}"></option>`
    )).join('');
}

function setVista(view) {
    botonesVista.forEach((button) => {
        button.classList.toggle('active', button.dataset.view === view);
    });

    tablaExistenciaPanel.classList.toggle('is-hidden', view === 'historial');
    tablaHistorialPanel.classList.toggle('is-hidden', view !== 'historial');
    movimientoPanel.classList.toggle('is-hidden', view !== 'ingreso' && view !== 'salida');

    if (view === 'ingreso' || view === 'salida') {
        tipoMovimiento = view === 'salida' ? 'Salida' : 'Ingreso';
        movimientoEtiqueta.innerText = tipoMovimiento;
        movimientoTitulo.innerText = `${tipoMovimiento} de repuesto`;
        document.getElementById('btnGuardarMovimiento').innerText = `Registrar ${tipoMovimiento.toLowerCase()}`;
        movimientoRepuesto.focus();
    }
}

async function cargarRepuestos() {
    estadoCargaRepuestos = 'Cargando datos...';
    mostrarEstadoCargaRepuestos();
    renderHistorial(); renderUltimosIngresos();
    try {
        const [repuestosData, historialData, ingresosData] = await Promise.all([
            window.api.repuestos.list(),
            window.api.repuestos.historial(),
            window.api.repuestos.ultimosIngresos()
        ]);

        repuestos = repuestosData;
        historial = historialData;
        ultimosIngresos = ingresosData;
        estadoCargaRepuestos = null;

        renderIndicadores();
        renderRepuestos();
        renderHistorial();
        renderUltimosIngresos();
        renderRepuestosList();
    } catch (error) {
        repuestos = []; historial = []; ultimosIngresos = []; renderRepuestosList();
        estadoCargaRepuestos = 'No se pudieron cargar los datos. Revisa la conexion y vuelve a abrir el modulo.';
        mostrarEstadoCargaRepuestos();
        renderHistorial(); renderUltimosIngresos();
        window.ui.alert(`No se pudo cargar el modulo de repuestos: ${error.message}`);
        return false;
    }
}

function abrirModalRepuesto() {
    formRepuesto.reset();
    modalRepuesto.classList.add('is-open');
    modalRepuesto.setAttribute('aria-hidden', 'false');
    document.getElementById('repuestoCodigo').focus();
}

function cerrarModalRepuesto() {
    modalRepuesto.classList.remove('is-open');
    modalRepuesto.setAttribute('aria-hidden', 'true');
    btnNuevoRepuesto.focus();
}

botonesVista.forEach((button) => {
    button.addEventListener('click', () => setVista(button.dataset.view));
});

buscarRepuesto.addEventListener('input', renderRepuestos);
enableEditableDatalist(movimientoRepuesto);
movimientoRepuesto.addEventListener('change', () => {
    const repuesto = getRepuestoSeleccionado();

    if (repuesto && tipoMovimiento === 'Ingreso') {
        movimientoCosto.value = Number(repuesto.costo || 0).toFixed(2);
    }
});

formMovimientoRepuesto.addEventListener('submit', async (event) => {
    event.preventDefault();

    const repuesto = getRepuestoSeleccionado();

    if (!repuesto) {
        window.ui.alert('Selecciona un repuesto registrado.');
        movimientoRepuesto.focus();
        return;
    }

    try {
        await window.api.repuestos.movimiento({
            idRepuesto: repuesto.id,
            tipo: tipoMovimiento,
            cantidad: Number(movimientoCantidad.value) || 0,
            costo: Number(movimientoCosto.value) || repuesto.costo,
            referencia: movimientoReferencia.value.trim(),
            observaciones: movimientoObservaciones.value.trim()
        });

        formMovimientoRepuesto.reset();
        await cargarRepuestos();
    } catch (error) {
        window.ui.alert(`No se pudo registrar el movimiento: ${error.message}`);
    }
});

btnNuevoRepuesto.addEventListener('click', abrirModalRepuesto);
btnCerrarRepuesto.addEventListener('click', cerrarModalRepuesto);
modalRepuesto.addEventListener('click', (event) => {
    if (event.target.hasAttribute('data-close-repuesto-modal')) {
        cerrarModalRepuesto();
    }
});

formRepuesto.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
        await window.api.repuestos.create({
            codigo: document.getElementById('repuestoCodigo').value.trim().toUpperCase(),
            nombre: document.getElementById('repuestoNombre').value.trim(),
            descripcion: document.getElementById('repuestoDescripcion').value.trim(),
            existencia: Number(document.getElementById('repuestoExistencia').value) || 0,
            costo: Number(document.getElementById('repuestoCosto').value) || 0
        });

        cerrarModalRepuesto();
        await cargarRepuestos();
    } catch (error) {
        window.ui.alert(`No se pudo guardar el repuesto: ${error.message}`);
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalRepuesto.classList.contains('is-open')) {
        cerrarModalRepuesto();
    }
});

setVista('existencia');
cargarRepuestos().catch(error => console.error('No se pudo completar la carga inicial:', error));

function mostrarEstadoCargaRepuestos() {
    tablaRepuestos.innerHTML = '<tr><td colspan="5" class="empty-row"></td></tr>';
    tablaRepuestos.querySelector('td').textContent = estadoCargaRepuestos;
    [totalRepuestos, existenciaTotal, bajoStock, valorInventario].forEach(indicador => { indicador.innerText = '--'; });
}
