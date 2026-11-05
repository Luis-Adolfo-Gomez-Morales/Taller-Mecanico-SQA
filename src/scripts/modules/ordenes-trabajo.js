let catalogoMecanicos = [];
const tablaOrdenesTrabajo = document.getElementById('tablaOrdenesTrabajo');
const buscarOrdenTrabajo = document.getElementById('buscarOrdenTrabajo');
const filtroEstadoOrdenTrabajo = document.getElementById('filtroEstadoOrdenTrabajo');
const formOrdenTrabajo = document.getElementById('formOrdenTrabajo');
const btnNuevaOrdenTrabajo = document.getElementById('btnNuevaOrdenTrabajo');
const modalOrdenTrabajo = document.getElementById('modalOrdenTrabajo');
const btnCerrarOrdenTrabajo = document.getElementById('btnCerrarOrdenTrabajo');
const btnGuardarOrdenTrabajo = document.getElementById('btnGuardarOrdenTrabajo');
const ordenTrabajoModo = document.getElementById('ordenTrabajoModo');
const totalOrdenesTrabajo = document.getElementById('totalOrdenesTrabajo');
const ordenesAbiertas = document.getElementById('ordenesAbiertas');
const ordenesProceso = document.getElementById('ordenesProceso');
const ordenesFinalizadas = document.getElementById('ordenesFinalizadas');
const totalRepuestosOrdenes = document.getElementById('totalRepuestosOrdenes');
const ordenPlaca = document.getElementById('ordenPlaca');
const ordenPlacasList = document.getElementById('ordenPlacasList');
const ordenPilotosList = document.getElementById('ordenPilotosList');
const ordenRepuestoBusqueda = document.getElementById('ordenRepuestoBusqueda');
const ordenRepuestoExistencia = document.getElementById('ordenRepuestoExistencia');
const ordenRepuestoCantidad = document.getElementById('ordenRepuestoCantidad');
const btnAgregarRepuestoOrden = document.getElementById('btnAgregarRepuestoOrden');
const ordenRepuestosInventarioList = document.getElementById('ordenRepuestosInventarioList');
const tablaRepuestosOrden = document.getElementById('tablaRepuestosOrden');
const ordenFormFields = Array.from(formOrdenTrabajo.querySelectorAll('input, select, textarea'));
const ordenTotalManoObra = document.getElementById('ordenTotalManoObra');
const ordenTotalRepuestosInput = document.getElementById('ordenTotalRepuestos');
const ordenHoraEntrada = document.getElementById('ordenHoraEntrada');
const ordenHoraSalida = document.getElementById('ordenHoraSalida');

let modoOrdenTrabajo = 'nuevo';
let repuestosOrdenActual = [];
let repuestoEditandoIndex = null;
let ordenSeleccionadaId = null;

// Los registros se consultan en MySQL al abrir la pantalla.
const catalogoVehiculos = [];
const inventarioRepuestos = [];
const ordenesTrabajo = [];
let estadoCargaOrdenes = 'Cargando datos...';
btnNuevaOrdenTrabajo.disabled = true;

function getOrdenFieldValue(id) {
    return document.getElementById(id).value.trim();
}

function setOrdenFieldValue(id, value = '') {
    const field = document.getElementById(id);
    if (['ordenTipoVehiculo', 'ordenMecanico'].includes(id) && value && !Array.from(field.options).some(option => option.value === value)) {
        const option = document.createElement('option'); option.value = value; option.textContent = value; field.append(option);
    }
    field.value = value ?? '';
}

function setOrdenChecked(id, value = false) {
    document.getElementById(id).checked = Boolean(value);
}

function formatCurrency(value) {
    return `Q${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[character]));
}

function formatFecha(value) {
    if (!value) {
        return 'Sin fecha';
    }

    const [year, month, day] = value.split('-');

    return `${day}/${month}/${year}`;
}

function formatHora(value, periodo = '') {
    if (!value) {
        return '';
    }

    return `${value} ${periodo}`.trim();
}

function formatHourValue(value) {
    return String(Number(value)).padStart(2, '0');
}

function normalizeMinuteValue(value, complete = false) {
    const minuteDigits = value.slice(0, 2);

    if (!minuteDigits) {
        return complete ? '00' : '';
    }

    if (minuteDigits.length === 1) {
        if (Number(minuteDigits) > 5) {
            return `0${minuteDigits}`;
        }

        return complete ? `${minuteDigits}0` : minuteDigits;
    }

    const minute = Math.min(Number(minuteDigits), 59);

    return String(minute).padStart(2, '0');
}

function splitTimeDigits(value) {
    const [rawHour = '', rawMinute = ''] = value.replace(/[^\d:]/g, '').split(':');
    const hourDigits = rawHour.slice(0, 2);
    const minuteDigits = rawMinute.slice(0, 2);

    if (!hourDigits) {
        return { hour: '', minute: minuteDigits };
    }

    if (hourDigits === '0') {
        return { hour: '', minute: minuteDigits };
    }

    if (/^0[1-9]$/.test(hourDigits)) {
        return { hour: hourDigits.charAt(1), minute: minuteDigits };
    }

    if (Number(hourDigits) >= 1 && Number(hourDigits) <= 12) {
        return { hour: hourDigits, minute: minuteDigits };
    }

    return {
        hour: hourDigits.charAt(0),
        minute: `${hourDigits.slice(1)}${minuteDigits}`.slice(0, 2)
    };
}

function normalizeTimeValue(value, complete = false) {
    const cleanedValue = value.replace(/[^\d:]/g, '').slice(0, 5);

    if (!cleanedValue) {
        return '';
    }

    if (cleanedValue.includes(':')) {
        const { hour, minute } = splitTimeDigits(cleanedValue);

        if (!hour) {
            return '';
        }

        return `${formatHourValue(hour)}:${normalizeMinuteValue(minute, complete)}`;
    }

    const digits = cleanedValue.slice(0, 4);

    if (!digits) {
        return '';
    }

    if (digits.startsWith('0')) {
        if (digits.length === 1) {
            return complete ? '' : '0';
        }

        return `${formatHourValue(digits.charAt(1))}:${normalizeMinuteValue(digits.slice(2), complete)}`;
    }

    if (digits.charAt(0) === '1' && digits.length === 1 && !complete) {
        return '1';
    }

    if (digits.charAt(0) === '1' && /^[0-2]$/.test(digits.charAt(1) || '')) {
        return `${digits.slice(0, 2)}:${normalizeMinuteValue(digits.slice(2), complete)}`;
    }

    return `${formatHourValue(digits.charAt(0))}:${normalizeMinuteValue(digits.slice(1), complete)}`;
}

function assistTimeInput(input, complete = false) {
    const formattedValue = normalizeTimeValue(input.value, complete);

    input.setCustomValidity('');

    if (input.value !== formattedValue) {
        input.value = formattedValue;
    }
}

function validateTimeInput(input) {
    assistTimeInput(input, true);

    if (input.required && !input.value) {
        input.setCustomValidity('Ingrese una hora valida del 1 al 12.');
        input.reportValidity();
        return false;
    }

    input.setCustomValidity('');
    return true;
}

function getTimeDigitIndex(value, position) {
    return value.slice(0, position).replace(/\D/g, '').length;
}

function setTimeValueFromDigits(input, digits, cursorDigitIndex = null, complete = false) {
    const safeDigits = digits.slice(0, 4);

    input.value = normalizeTimeValue(safeDigits, complete);

    if (cursorDigitIndex === null || document.activeElement !== input) {
        return;
    }

    if (cursorDigitIndex >= safeDigits.length) {
        input.setSelectionRange(input.value.length, input.value.length);
        return;
    }

    const safeDigitIndex = Math.max(0, Math.min(cursorDigitIndex, input.value.replace(/\D/g, '').length));
    let currentDigitIndex = 0;
    let cursorPosition = input.value.length;

    for (let index = 0; index < input.value.length; index += 1) {
        if (/\d/.test(input.value.charAt(index))) {
            if (currentDigitIndex === safeDigitIndex) {
                cursorPosition = index;
                break;
            }

            currentDigitIndex += 1;
        }
    }

    input.setSelectionRange(cursorPosition, cursorPosition);
}

function handleTimeKeydown(event) {
    const allowedKeys = [
        'Tab',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End'
    ];

    if (event.ctrlKey || event.metaKey || allowedKeys.includes(event.key)) {
        return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();

        const input = event.target;
        const digits = input.value.replace(/\D/g, '');
        let startIndex = getTimeDigitIndex(input.value, input.selectionStart);
        let endIndex = getTimeDigitIndex(input.value, input.selectionEnd);

        if (startIndex === endIndex) {
            if (event.key === 'Backspace') {
                startIndex = Math.max(0, startIndex - 1);
            } else {
                endIndex = Math.min(digits.length, endIndex + 1);
            }
        }

        const nextDigits = `${digits.slice(0, startIndex)}${digits.slice(endIndex)}`;
        setTimeValueFromDigits(input, nextDigits, startIndex);
        return;
    }

    if (/^\d$/.test(event.key)) {
        event.preventDefault();

        const input = event.target;
        const digits = input.value.replace(/\D/g, '');
        const startIndex = getTimeDigitIndex(input.value, input.selectionStart);
        const endIndex = getTimeDigitIndex(input.value, input.selectionEnd);
        const nextDigits = `${digits.slice(0, startIndex)}${event.key}${digits.slice(endIndex)}`;

        setTimeValueFromDigits(input, nextDigits, startIndex + 1);
        return;
    }

    event.preventDefault();
}

function handleTimePaste(event) {
    event.preventDefault();

    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '');

    if (!pastedDigits) {
        return;
    }

    const input = event.target;
    const digits = input.value.replace(/\D/g, '');
    const startIndex = getTimeDigitIndex(input.value, input.selectionStart);
    const endIndex = getTimeDigitIndex(input.value, input.selectionEnd);
    const nextDigits = `${digits.slice(0, startIndex)}${pastedDigits}${digits.slice(endIndex)}`;

    setTimeValueFromDigits(input, nextDigits, startIndex + pastedDigits.length);
}


function formatPlateInput(value) {
    const normalized = value.toUpperCase().replace(/\s+/g, '');

    if (/^[A-Z]$/.test(normalized)) {
        return `${normalized}-`;
    }

    if (/^[A-Z][^-]/.test(normalized)) {
        return `${normalized.charAt(0)}-${normalized.slice(1)}`;
    }

    return normalized;
}

function renderDatalistOptions(listElement, values) {
    listElement.innerHTML = [...new Set(values.filter(Boolean))].map((value) => (
        `<option value="${escapeHtml(value)}"></option>`
    )).join('');
}

function renderOrdenDatalists() {
    sincronizarSelectorServicio();
    actualizarSugerenciasServicio();
    renderDatalistOptions(ordenPlacasList, catalogoVehiculos.map((vehiculo) => vehiculo.placa));
    renderDatalistOptions(ordenPilotosList, catalogoVehiculos.map((vehiculo) => vehiculo.piloto));
    document.getElementById('ordenMecanico').innerHTML = '<option value="">Selecciona el mecanico</option>' + catalogoMecanicos.map(m => `<option value="${m.id_mecanico}">${escapeHtml(m.nombre)} - ${escapeHtml(m.dpi)}</option>`).join('');
    renderDatalistOptions(ordenRepuestosInventarioList, inventarioRepuestos.map((repuesto) => `${repuesto.codigo} - ${repuesto.nombre}`));
}

function mapVehiculoCatalogo(vehiculo) {
    return {
        placa: vehiculo.placa,
        vehiculo: vehiculo.modelo,
        marca: vehiculo.marca,
        piloto: vehiculo.cliente,
        tipoVehiculo: vehiculo.tipo,
        kilometraje: vehiculo.kilometraje
    };
}

function reemplazarContenido(array, values) {
    array.splice(0, array.length, ...values);
}

function buscarRepuestoInventario(value) {
    const normalized = value.trim().toLowerCase();

    return inventarioRepuestos.find((repuesto) => (
        repuesto.codigo.toLowerCase() === normalized
        || repuesto.nombre.toLowerCase() === normalized
        || `${repuesto.codigo} - ${repuesto.nombre}`.toLowerCase() === normalized
    ));
}

function actualizarExistenciaRepuesto() {
    const repuesto = buscarRepuestoInventario(ordenRepuestoBusqueda.value);

    if (!repuesto) {
        ordenRepuestoExistencia.value = '';
        ordenRepuestoCantidad.removeAttribute('max');
        return;
    }

    ordenRepuestoExistencia.value = `${repuesto.existencia} unidades`;
    ordenRepuestoCantidad.max = repuesto.existencia;

    if (!ordenRepuestoCantidad.value || Number(ordenRepuestoCantidad.value) < 1) {
        ordenRepuestoCantidad.value = 1;
    }
}

function normalizarRepuestosOrden(repuestos) {
    if (!Array.isArray(repuestos)) {
        return [];
    }

    return repuestos.map((repuesto) => ({
        idRepuesto: repuesto.idRepuesto,
        codigo: repuesto.codigo,
        nombre: repuesto.nombre,
        existencia: inventarioRepuestos.find(item => item.id === repuesto.idRepuesto)?.existencia ?? null,
        cantidad: Number(repuesto.cantidad) || 1,
        cantidadTexto: repuesto.cantidadTexto || String(repuesto.cantidad || 1),
        costo: Number(repuesto.costo) || 0
    }));
}

function parseCantidadRepuesto(value) {
    const rawValue = String(value || '').trim().replace(',', '.');

    if (!rawValue) {
        return null;
    }

    if (/^\d+\/\d+$/.test(rawValue)) {
        const [numerator, denominator] = rawValue.split('/').map(Number);

        if (denominator === 0 || numerator <= 0) {
            return null;
        }

        return {
            valor: numerator / denominator,
            texto: rawValue
        };
    }

    if (/^\d+(\.\d+)?$/.test(rawValue)) {
        const numericValue = Number(rawValue);

        if (numericValue <= 0) {
            return null;
        }

        return {
            valor: numericValue,
            texto: rawValue
        };
    }

    return null;
}

function formatCantidadRepuesto(repuesto) {
    return repuesto.cantidadTexto || String(repuesto.cantidad || 0);
}

function calcularTotalRepuestos() {
    return repuestosOrdenActual.reduce((total, repuesto) => (
        total + (Number(repuesto.cantidad) || 0) * (Number(repuesto.costo) || 0)
    ), 0);
}

function actualizarTotalRepuestos() {
    const total = calcularTotalRepuestos();

    ordenTotalRepuestosInput.value = total ? total.toFixed(2) : '';
}

function renderRepuestosOrden() {
    if (repuestosOrdenActual.length === 0) {
        tablaRepuestosOrden.innerHTML = `
            <tr>
                <td colspan="4" class="empty-row">No hay repuestos agregados.</td>
            </tr>
        `;
        actualizarTotalRepuestos();
        return;
    }

    tablaRepuestosOrden.innerHTML = repuestosOrdenActual.map((repuesto, index) => {
        const isEditing = repuestoEditandoIndex === index && modoOrdenTrabajo !== 'vista';
        const quantityCell = isEditing
            ? `<input class="js-cantidad-repuesto" type="text" value="${escapeHtml(formatCantidadRepuesto(repuesto))}" data-index="${index}" aria-label="Cantidad de ${escapeHtml(repuesto.nombre)}">`
            : escapeHtml(formatCantidadRepuesto(repuesto));
        const actionCell = modoOrdenTrabajo === 'vista'
            ? '<span class="parts-readonly-action">Solo lectura</span>'
            : isEditing
            ? `
                <button class="parts-edit-button js-guardar-cantidad" type="button" data-index="${index}">Guardar</button>
                <button class="parts-ghost-button js-cancelar-cantidad" type="button" data-index="${index}">Cancelar</button>
            `
            : `
                <button class="parts-edit-button js-modificar-repuesto" type="button" data-index="${index}">Modificar</button>
                <button class="parts-remove-button js-quitar-repuesto" type="button" data-index="${index}" aria-label="Quitar ${escapeHtml(repuesto.nombre)}">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 6l12 12"></path>
                        <path d="M18 6L6 18"></path>
                    </svg>
                </button>
            `;

        return `
            <tr>
                <td>${escapeHtml(repuesto.codigo)}</td>
                <td>${escapeHtml(repuesto.nombre)}</td>
                <td>${quantityCell}<div class="parts-actions">${actionCell}</div></td>
                <td>${formatCurrency(repuesto.costo)}</td>
            </tr>
        `;
    }).join('');

    actualizarTotalRepuestos();
}

function existenciaDisponibleOrden(idRepuesto, existencia) {
    const original = ordenesTrabajo.find(orden => orden.id === ordenSeleccionadaId);
    const asignada = (original?.repuestos || []).filter(item => item.idRepuesto === idRepuesto).reduce((total, item) => total + Number(item.cantidad || 0), 0);
    return Number(existencia || 0) + asignada;
}

function agregarRepuestoOrden() {
    const repuesto = buscarRepuestoInventario(ordenRepuestoBusqueda.value);

    if (!repuesto) {
        window.ui.alert('Selecciona un repuesto del inventario.');
        ordenRepuestoBusqueda.focus();
        return;
    }

    const cantidad = parseCantidadRepuesto(ordenRepuestoCantidad.value);

    if (!cantidad) {
        window.ui.alert('Ingresa una cantidad valida. Puedes usar enteros, decimales o fracciones como 1/2.');
        ordenRepuestoCantidad.focus();
        return;
    }

    const repuestoAgregado = repuestosOrdenActual.find((item) => item.codigo === repuesto.codigo);
    const cantidadActual = repuestoAgregado ? Number(repuestoAgregado.cantidad) || 0 : 0;

    if (cantidadActual + cantidad.valor > existenciaDisponibleOrden(repuesto.id, repuesto.existencia)) {
        window.ui.alert('No hay suficiente existencia disponible para agregar esa cantidad.');
        ordenRepuestoCantidad.focus();
        return;
    }

    if (repuestoAgregado) {
        repuestoAgregado.cantidad = cantidadActual + cantidad.valor;
        repuestoAgregado.cantidadTexto = String(repuestoAgregado.cantidad);
    } else {
        repuestosOrdenActual.push({
            idRepuesto: repuesto.id,
            codigo: repuesto.codigo,
            nombre: repuesto.nombre,
            existencia: repuesto.existencia,
            cantidad: cantidad.valor,
            cantidadTexto: cantidad.texto,
            costo: repuesto.costo
        });
    }

    ordenRepuestoBusqueda.value = '';
    ordenRepuestoExistencia.value = '';
    ordenRepuestoCantidad.value = 1;
    renderRepuestosOrden();
    ordenRepuestoBusqueda.focus();
}

function buscarVehiculoPorPlaca(placa) {
    const normalized = formatPlateInput(placa);

    return catalogoVehiculos.find((vehiculo) => vehiculo.placa === normalized);
}

function autocompletarVehiculoPorPlaca() {
    const vehiculo = buscarVehiculoPorPlaca(ordenPlaca.value);

    if (!vehiculo) {
        ['ordenVehiculo', 'ordenMarca', 'ordenTipoVehiculo', 'ordenPiloto'].forEach(id => setOrdenFieldValue(id, ''));
        return;
    }

    setOrdenFieldValue('ordenVehiculo', vehiculo.vehiculo);
    setOrdenFieldValue('ordenMarca', vehiculo.marca);
    setOrdenFieldValue('ordenTipoVehiculo', vehiculo.tipoVehiculo);
    setOrdenFieldValue('ordenPiloto', vehiculo.piloto);
}

function applyPlateFormat(input) {
    if (input.dataset.skipPlateFormat === 'true') {
        input.dataset.skipPlateFormat = 'false';
        input.value = input.value.toUpperCase().replace(/\s+/g, '');
        return;
    }

    const formattedValue = formatPlateInput(input.value);

    if (input.value !== formattedValue) {
        input.value = formattedValue;
    }
}

function handlePlateKeydown(event) {
    if (event.key === 'Backspace' || event.key === 'Delete') {
        if (!event.target.value) {
            event.target.dataset.skipPlateFormat = 'false';
            return;
        }

        if (/^[A-Z]-$/.test(event.target.value.toUpperCase())) {
            event.preventDefault();
            event.target.value = '';
            event.target.dataset.skipPlateFormat = 'false';

            return;
        }

        event.target.dataset.skipPlateFormat = 'true';
        return;
    }

    event.target.dataset.skipPlateFormat = 'false';
}

function getEstadoClass(estado) {
    if (estado === 'Finalizada') {
        return 'normal';
    }

    if (estado === 'En proceso') {
        return 'medium';
    }

    return 'high';
}

function setOrdenSoloLectura(isReadOnly) {
    ordenFormFields.forEach((field) => {
        field.disabled = isReadOnly;
    });

    document.getElementById('ordenTipoVehiculo').disabled = true;
    btnGuardarOrdenTrabajo.hidden = isReadOnly;
    btnAgregarRepuestoOrden.hidden = isReadOnly;
    modalOrdenTrabajo.classList.toggle('is-readonly', isReadOnly);
    ordenTrabajoModo.innerText = isReadOnly ? 'Detalle' : modoOrdenTrabajo === 'edicion' ? 'Edicion' : 'Registro';
    renderRepuestosOrden();
    renderOpcionesTrabajo();
}

function limpiarOrdenTrabajo() {
    formOrdenTrabajo.reset();
    ordenSeleccionadaId = null;
    ordenTotalManoObra.value = '';
    repuestosOrdenActual = [];
    repuestoEditandoIndex = null;
    ordenRepuestoExistencia.value = '';
    ordenRepuestoCantidad.value = 1;
    renderRepuestosOrden();
    renderOpcionesTrabajo();
}

function abrirRegistroOrdenTrabajo() {
    if (estadoCargaOrdenes) return;
    modoOrdenTrabajo = 'nuevo';
    ordenSeleccionadaId = null;
    setOrdenSoloLectura(false);
    limpiarOrdenTrabajo();
    setOrdenSoloLectura(false);

    modalOrdenTrabajo.classList.add('is-open');
    modalOrdenTrabajo.setAttribute('aria-hidden', 'false');
    ordenPlaca.focus();
}

function ocultarOrdenTrabajo() {
    modalOrdenTrabajo.classList.remove('is-open');
    modalOrdenTrabajo.setAttribute('aria-hidden', 'true');
    btnNuevaOrdenTrabajo.focus();
}

function cargarOrdenEnFormulario(orden) {
    setOrdenFieldValue('ordenFechaEntrada', orden.fechaEntrada);
    setOrdenFieldValue('ordenHoraEntrada', orden.horaEntrada);
    setOrdenFieldValue('ordenPeriodoEntrada', orden.periodoEntrada || 'AM');
    setOrdenFieldValue('ordenFechaSalida', orden.fechaSalida);
    setOrdenFieldValue('ordenHoraSalida', orden.horaSalida);
    setOrdenFieldValue('ordenPeriodoSalida', orden.periodoSalida || 'PM');
    setOrdenFieldValue('ordenNumero', orden.numero);
    setOrdenFieldValue('ordenEstado', orden.estado);
    Array.from(document.getElementById('ordenServicios').options).forEach(option => { option.selected = (orden.servicios || []).includes(Number(option.value)); });
    setOrdenFieldValue('ordenSerie', orden.serie);
    setOrdenFieldValue('ordenVehiculo', orden.vehiculo);
    setOrdenFieldValue('ordenPlaca', orden.placa);
    setOrdenFieldValue('ordenPiloto', orden.piloto);
    setOrdenFieldValue('ordenMarca', orden.marca);
    setOrdenFieldValue('ordenMecanico', orden.idMecanico ? String(orden.idMecanico) : orden.mecanico);
    setOrdenFieldValue('ordenKilometraje', orden.kilometraje);
    setOrdenFieldValue('ordenProximoServicio', orden.proximoServicio);
    setOrdenFieldValue('ordenTipoVehiculo', orden.tipoVehiculo);
    setOrdenChecked('ordenManoMecanico', orden.manoMecanico);
    setOrdenChecked('ordenManoElectronico', orden.manoElectronico);
    setOrdenChecked('ordenManoPintura', orden.manoPintura);
    setOrdenChecked('ordenManoPinchazo', orden.manoPinchazo);
    renderOpcionesTrabajo();
    setOrdenFieldValue('ordenTrabajos', orden.trabajos);
    setOrdenFieldValue('ordenObservaciones', orden.observaciones);
    setOrdenFieldValue('ordenTotalManoObra', orden.totalManoObra);
    repuestosOrdenActual = normalizarRepuestosOrden(orden.repuestos);
    repuestoEditandoIndex = null;
    renderRepuestosOrden();
    renderOpcionesTrabajo();
}

function getOrdenFormulario() {
    const ordenActual = ordenesTrabajo.find((orden) => orden.id === ordenSeleccionadaId);

    return {
        numero: getOrdenFieldValue('ordenNumero'),
        serie: getOrdenFieldValue('ordenSerie').toUpperCase() || 'SERIE A',
        fechaEntrada: document.getElementById('ordenFechaEntrada').value,
        horaEntrada: getOrdenFieldValue('ordenHoraEntrada'),
        periodoEntrada: document.getElementById('ordenPeriodoEntrada').value,
        fechaSalida: document.getElementById('ordenFechaSalida').value,
        horaSalida: getOrdenFieldValue('ordenHoraSalida'),
        periodoSalida: document.getElementById('ordenPeriodoSalida').value,
        vehiculo: getOrdenFieldValue('ordenVehiculo'),
        placa: formatPlateInput(getOrdenFieldValue('ordenPlaca')),
        piloto: getOrdenFieldValue('ordenPiloto'),
        marca: getOrdenFieldValue('ordenMarca'),
        idMecanico: catalogoMecanicos.find(m => String(m.id_mecanico) === getOrdenFieldValue('ordenMecanico'))?.id_mecanico ?? null,
        mecanico: catalogoMecanicos.find(m => String(m.id_mecanico) === getOrdenFieldValue('ordenMecanico'))?.nombre || getOrdenFieldValue('ordenMecanico'),
        departamento: ordenesTrabajo.find(orden => orden.id === ordenSeleccionadaId)?.departamento ?? null,
        kilometraje: getOrdenFieldValue('ordenKilometraje'),
        proximoServicio: getOrdenFieldValue('ordenProximoServicio'),
        tipoVehiculo: document.getElementById('ordenTipoVehiculo').value,
        estado: getOrdenFieldValue('ordenEstado'),
        idVehiculo: ordenActual?.idVehiculo || null,
        servicios: Array.from(document.getElementById('ordenServicios').selectedOptions, option => Number(option.value)),
        manoMecanico: document.getElementById('ordenManoMecanico').checked,
        manoElectronico: document.getElementById('ordenManoElectronico').checked,
        manoPintura: document.getElementById('ordenManoPintura').checked,
        manoPinchazo: document.getElementById('ordenManoPinchazo').checked,
        totalManoObra: Number(getOrdenFieldValue('ordenTotalManoObra')) || 0,
        totalRepuestos: calcularTotalRepuestos(),
        trabajos: getOrdenFieldValue('ordenTrabajos'),
        repuestos: repuestosOrdenActual.map((repuesto) => ({ ...repuesto })),
        observaciones: getOrdenFieldValue('ordenObservaciones')
    };
}

function verDetalleOrden(index) {
    const orden = getOrdenesFiltradas()[index];

    if (!orden) {
        return;
    }

    modoOrdenTrabajo = 'vista';
    ordenSeleccionadaId = orden.id;
    cargarOrdenEnFormulario(orden);
    setOrdenSoloLectura(true);
    modalOrdenTrabajo.classList.add('is-open');
    modalOrdenTrabajo.setAttribute('aria-hidden', 'false');
    btnCerrarOrdenTrabajo.focus();
}

function editarOrden(index) {
    const orden = getOrdenesFiltradas()[index];

    if (!orden) {
        return;
    }

    modoOrdenTrabajo = 'edicion';
    ordenSeleccionadaId = orden.id;
    cargarOrdenEnFormulario(orden);
    setOrdenSoloLectura(false);
    modalOrdenTrabajo.classList.add('is-open');
    modalOrdenTrabajo.setAttribute('aria-hidden', 'false');
    ordenPlaca.focus();
}

const mesIndicadoresOrdenes = document.getElementById('mesIndicadoresOrdenes');
const fechaIndicadores = new Date();
mesIndicadoresOrdenes.value = `${fechaIndicadores.getFullYear()}-${String(fechaIndicadores.getMonth() + 1).padStart(2, '0')}`;
mesIndicadoresOrdenes.addEventListener('change', () => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mesIndicadoresOrdenes.value)) {
        const hoy = new Date();
        mesIndicadoresOrdenes.value = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
    }
    renderIndicadoresOrdenes();
});

function renderIndicadoresOrdenes() {
    if (estadoCargaOrdenes) { mostrarEstadoCargaOrdenestrabajo(); return; }
    const ordenesMes = ordenesTrabajo.filter(orden => String(orden.fechaCreacion || '').slice(0, 7) === mesIndicadoresOrdenes.value);
    totalOrdenesTrabajo.innerText = ordenesMes.length;
    ordenesAbiertas.innerText = ordenesMes.filter(orden => orden.estado === 'Abierta').length;
    ordenesProceso.innerText = ordenesMes.filter(orden => orden.estado === 'En proceso').length;
    ordenesFinalizadas.innerText = ordenesMes.filter(orden => orden.estado === 'Finalizada').length;
    totalRepuestosOrdenes.innerText = inventarioRepuestos.reduce((total, repuesto) => total + Number(repuesto.existencia || 0), 0).toLocaleString('es-GT');
}

function formatOrderSearchInput(value, deleting = false) {
    let text = value.toUpperCase().replace(/^(\p{L})-(?=[\p{L}\s])/u, '$1');
    if (/^\p{L}$/u.test(text) && !deleting) return `${text}-`;
    return text.replace(/^(\p{L})-?(?=\d)/u, '$1-');
}

function normalizarBusquedaOrden(value) {
    return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function getOrdenesFiltradas() {
    const busqueda = normalizarBusquedaOrden(buscarOrdenTrabajo.value.trim().replace(/^(\p{L})-$/u, '$1'));
    const estado = filtroEstadoOrdenTrabajo.value;

    return ordenesTrabajo.filter((orden) => {
        const coincideBusqueda = [
            orden.numero,
            orden.serie,
            orden.placa,
            orden.vehiculo,
            orden.piloto,
            orden.mecanico,
            orden.departamento
        ].filter(Boolean).some((value) => normalizarBusquedaOrden(value).includes(busqueda));
        const coincideEstado = estado === 'todos' || orden.estado === estado;

        return coincideBusqueda && coincideEstado;
    }).sort((ordenA, ordenB) => Number(ordenB.numero) - Number(ordenA.numero));
}

function renderOrdenesTrabajo() {
    if (estadoCargaOrdenes) { mostrarEstadoCargaOrdenestrabajo(); return; }
    const ordenesFiltradas = getOrdenesFiltradas();

    tablaOrdenesTrabajo.innerHTML = ordenesFiltradas.map((orden, index) => `
        <tr>
            <td>${orden.serie} - ${orden.numero}</td>
            <td>${orden.placa}</td>
            <td>${orden.vehiculo}</td>
            <td>${orden.piloto || 'Sin asignar'}</td>
            <td>${orden.mecanico || 'Sin asignar'}</td>
            <td>${formatFecha(orden.fechaEntrada)} ${formatHora(orden.horaEntrada, orden.periodoEntrada)}</td>
            <td><div class="order-state-actions"><span class="status ${getEstadoClass(orden.estado)}">${orden.estado}</span>${orden.estado === 'Abierta' || orden.estado === 'En proceso' ? `<button type="button" class="icon-action js-avanzar-orden" data-id="${orden.id}" title="${orden.estado === 'Abierta' ? 'Iniciar trabajo' : 'Finalizar trabajo'}" aria-label="${orden.estado === 'Abierta' ? 'Iniciar trabajo' : 'Finalizar trabajo'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${orden.estado === 'Abierta' ? 'M8 5l11 7-11 7z' : 'M5 12l4 4L19 6'}"/></svg></button>` : ''}</div></td>
            <td class="work-order-actions-cell">
                <div class="table-actions">
                    <button class="icon-action js-ver-orden" type="button" data-index="${index}" aria-label="Ver detalle de orden ${orden.numero}">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="icon-action js-editar-orden" type="button" data-index="${index}" aria-label="Editar orden ${orden.numero}">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-action js-eliminar-orden" type="button" data-id="${orden.id}" aria-label="Eliminar orden ${orden.numero}">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 6h18"></path>
                            <path d="M8 6V4h8v2"></path>
                            <path d="M19 6l-1 14H6L5 6"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    if (ordenesFiltradas.length === 0) {
        tablaOrdenesTrabajo.innerHTML = `
            <tr>
                <td colspan="8" class="empty-row">No hay ordenes de trabajo con esos filtros.</td>
            </tr>
        `;
    }

    renderIndicadoresOrdenes();
}

async function cargarDatosOrdenes() {
    estadoCargaOrdenes = 'Cargando datos...';
    btnNuevaOrdenTrabajo.disabled = true;
    mostrarEstadoCargaOrdenestrabajo();
    try {
        const [vehiculos, repuestos, ordenes, servicios, mecanicos] = await Promise.all([
            window.api.vehiculos.list(),
            window.api.repuestos.list(),
            window.api.ordenes.list(),
            window.api.servicios.list(),
            window.api.mecanicos.list()
        ]);

        catalogoMecanicos = mecanicos;
        document.getElementById('ordenServicios').replaceChildren(...servicios.map(servicio => {
            const option = document.createElement('option'); option.value = servicio.id; option.textContent = servicio.nombre; return option;
        }));
        reemplazarContenido(catalogoVehiculos, vehiculos.map(mapVehiculoCatalogo));
        reemplazarContenido(inventarioRepuestos, repuestos);
        reemplazarContenido(ordenesTrabajo, ordenes);
        estadoCargaOrdenes = null;
        btnNuevaOrdenTrabajo.disabled = false;
        renderOrdenDatalists();
        renderRepuestosOrden();
        renderOrdenesTrabajo();
    } catch (error) {
        reemplazarContenido(ordenesTrabajo, []); reemplazarContenido(catalogoVehiculos, []); reemplazarContenido(inventarioRepuestos, []); renderOrdenDatalists();
        estadoCargaOrdenes = 'No se pudieron cargar los datos. Revisa la conexion y vuelve a abrir el modulo.';
        mostrarEstadoCargaOrdenestrabajo();
        window.ui.alert(`No se pudieron cargar las ordenes de trabajo: ${error.message}`);
        return false;
    }
}

formOrdenTrabajo.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (modoOrdenTrabajo === 'vista' || estadoCargaOrdenes) {
        return;
    }

    if (!validateTimeInput(ordenHoraEntrada)) {
        return;
    }

    validateTimeInput(ordenHoraSalida);

    try {
        const orden = getOrdenFormulario();

        if (modoOrdenTrabajo === 'edicion' && ordenSeleccionadaId) {
            await window.api.ordenes.update(ordenSeleccionadaId, orden);
        } else {
            await window.api.ordenes.create(orden);
        }

        limpiarOrdenTrabajo();
        await cargarDatosOrdenes();
        ocultarOrdenTrabajo();
    } catch (error) {
        window.ui.alert(`No se pudo guardar la orden de trabajo: ${error.message}`);
    }
});

ordenPlaca.addEventListener('keydown', handlePlateKeydown);
ordenPlaca.addEventListener('input', () => {
    applyPlateFormat(ordenPlaca);
    autocompletarVehiculoPorPlaca();
});
ordenPlaca.addEventListener('change', autocompletarVehiculoPorPlaca);
buscarOrdenTrabajo.addEventListener('input', (event) => {
    if (!event.isComposing) {
        const before = buscarOrdenTrabajo.value;
        const cursor = buscarOrdenTrabajo.selectionStart ?? before.length;
        const formatted = formatOrderSearchInput(before, event.inputType?.startsWith('delete'));
        if (formatted !== before) {
            buscarOrdenTrabajo.value = formatted;
            const position = cursor === 0 ? 0 : Math.max(0, Math.min(formatted.length, cursor + formatted.length - before.length));
            buscarOrdenTrabajo.setSelectionRange?.(position, position);
        }
    }
    renderOrdenesTrabajo();
});
[ordenHoraEntrada, ordenHoraSalida].forEach((input) => {
    input.addEventListener('keydown', handleTimeKeydown);
    input.addEventListener('paste', handleTimePaste);
    input.addEventListener('input', () => assistTimeInput(input));
    input.addEventListener('blur', () => assistTimeInput(input, true));
});
ordenRepuestoBusqueda.addEventListener('input', actualizarExistenciaRepuesto);
ordenRepuestoBusqueda.addEventListener('change', actualizarExistenciaRepuesto);
btnAgregarRepuestoOrden.addEventListener('click', agregarRepuestoOrden);
tablaRepuestosOrden.addEventListener('click', (event) => {
    const editButton = event.target.closest('.js-modificar-repuesto');
    const saveButton = event.target.closest('.js-guardar-cantidad');
    const cancelButton = event.target.closest('.js-cancelar-cantidad');
    const removeButton = event.target.closest('.js-quitar-repuesto');

    if (modoOrdenTrabajo === 'vista') {
        return;
    }

    if (editButton) {
        repuestoEditandoIndex = Number(editButton.dataset.index);
        renderRepuestosOrden();
        const quantityInput = tablaRepuestosOrden.querySelector('.js-cantidad-repuesto');

        if (quantityInput) {
            quantityInput.focus();
            quantityInput.select();
        }
        return;
    }

    if (cancelButton) {
        repuestoEditandoIndex = null;
        renderRepuestosOrden();
        return;
    }

    if (saveButton) {
        const index = Number(saveButton.dataset.index);
        const repuesto = repuestosOrdenActual[index];
        const quantityInput = tablaRepuestosOrden.querySelector(`.js-cantidad-repuesto[data-index="${index}"]`);
        const cantidad = parseCantidadRepuesto(quantityInput?.value);

        if (!repuesto || !cantidad) {
            window.ui.alert('Ingresa una cantidad valida. Puedes usar enteros, decimales o fracciones como 1/2.');
            quantityInput?.focus();
            return;
        }

        if (cantidad.valor > existenciaDisponibleOrden(repuesto.idRepuesto, repuesto.existencia)) {
            window.ui.alert('La cantidad no puede ser mayor que la existencia disponible.');
            quantityInput.focus();
            return;
        }

        repuesto.cantidad = cantidad.valor;
        repuesto.cantidadTexto = cantidad.texto;
        repuestoEditandoIndex = null;
        renderRepuestosOrden();
        return;
    }

    if (removeButton) {
        repuestosOrdenActual.splice(Number(removeButton.dataset.index), 1);
        repuestoEditandoIndex = null;
        renderRepuestosOrden();
    }
});
tablaRepuestosOrden.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || !event.target.classList.contains('js-cantidad-repuesto')) {
        return;
    }

    event.preventDefault();
    const saveButton = tablaRepuestosOrden.querySelector(`.js-guardar-cantidad[data-index="${event.target.dataset.index}"]`);

    if (saveButton) {
        saveButton.click();
    }
});
filtroEstadoOrdenTrabajo.addEventListener('change', renderOrdenesTrabajo);
btnNuevaOrdenTrabajo.addEventListener('click', abrirRegistroOrdenTrabajo);
btnCerrarOrdenTrabajo.addEventListener('click', ocultarOrdenTrabajo);
modalOrdenTrabajo.addEventListener('click', (event) => {
    if (event.target.hasAttribute('data-close-work-order-modal')) {
        event.preventDefault();
    }
});
tablaOrdenesTrabajo.addEventListener('click', async (event) => {
    const avanzar = event.target.closest('.js-avanzar-orden');
    if (avanzar) { await avanzarEstadoOrden(avanzar); return; }
    const detailButton = event.target.closest('.js-ver-orden');
    const editButton = event.target.closest('.js-editar-orden');
    const deleteButton = event.target.closest('.js-eliminar-orden');

    if (detailButton) {
        verDetalleOrden(Number(detailButton.dataset.index));
    }

    if (editButton) {
        editarOrden(Number(editButton.dataset.index));
    }

    if (deleteButton && await window.ui.confirm('Desea eliminar esta orden de trabajo?', { title: 'Eliminar registro', confirmText: 'Eliminar', danger: true })) {
        window.api.ordenes.remove(Number(deleteButton.dataset.id))
            .then(cargarDatosOrdenes)
            .catch((error) => window.ui.alert(`No se pudo eliminar la orden: ${error.message}`));
    }
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalOrdenTrabajo.classList.contains('is-open')) {
        ocultarOrdenTrabajo();
    }
});

cargarDatosOrdenes().catch(error => console.error('No se pudo completar la carga inicial:', error));

function mostrarEstadoCargaOrdenestrabajo() {
    tablaOrdenesTrabajo.innerHTML = '<tr><td colspan="8" class="empty-row"></td></tr>';
    tablaOrdenesTrabajo.querySelector('td').textContent = estadoCargaOrdenes;
    [totalOrdenesTrabajo, ordenesAbiertas, ordenesProceso, ordenesFinalizadas, totalRepuestosOrdenes].forEach(indicador => { indicador.innerText = '--'; });
}


function tiposTrabajoOpciones() {
    return [['ordenManoMecanico', 'Mecánico'], ['ordenManoElectronico', 'Eléctrico'], ['ordenManoPintura', 'Enderezado y Pintura'], ['ordenManoPinchazo', 'Pinchazo']];
}


function renderOpcionesTrabajo() {
    const tipos = tiposTrabajoOpciones().filter(([id]) => document.getElementById(id).checked);
    const servicios = Array.from(document.getElementById('ordenServicios').options).filter(option => option.selected);
    const tipo = document.getElementById('ordenTipoTrabajoBusqueda');
    // Mantener visibles las selecciones historicas multiples hasta que se cambien.
    const value = tipos.map(([, nombre]) => nombre).join(', ');
    if (tipos.length > 1 && !Array.from(tipo.options).some(option => option.value === value)) {
        const option = document.createElement('option'); option.value = value; option.textContent = value; tipo.append(option);
    }
    tipo.value = value;
    document.getElementById('ordenServicioBusqueda').value = servicios.map(option => option.textContent).join(', ');
    document.getElementById('ordenServicioBusqueda').setCustomValidity?.('');
    document.getElementById('ordenServicioBusqueda').hidden = true;
    document.getElementById('ordenServicioSelector').hidden = false;
    sincronizarSelectorServicio();
    actualizarSugerenciasServicio();
}

function actualizarSugerenciasServicio() {
    const palabras = normalizarBusquedaOrden(document.getElementById('ordenServicioBusqueda').value).trim().split(/\s+/).filter(Boolean);
    const opciones = Array.from(document.getElementById('ordenServicios').options).filter(option => palabras.every(palabra => normalizarBusquedaOrden(option.textContent).includes(palabra)));
    document.getElementById('ordenServiciosSugeridos').innerHTML = opciones.map(option => `<option value="${escapeHtml(option.textContent)}"></option>`).join('');
}

function seleccionarServicio() {
    if (modoOrdenTrabajo === 'vista') return;
    const input = document.getElementById('ordenServicioBusqueda');
    const value = normalizarBusquedaOrden(input.value.trim());
    const opciones = Array.from(document.getElementById('ordenServicios').options);
    const actual = normalizarBusquedaOrden(opciones.filter(option => option.selected).map(option => option.textContent).join(', '));
    if (actual === value) { input.setCustomValidity?.(''); return; }
    const coincidencias = opciones.filter(option => normalizarBusquedaOrden(option.textContent) === value);
    const valida = !value || coincidencias.length === 1;
    input.setCustomValidity?.(valida ? '' : 'Selecciona un servicio del catalogo.');
    if (!valida) return;
    opciones.forEach(option => { option.selected = option === coincidencias[0]; });
    if (coincidencias[0]) input.value = coincidencias[0].textContent;
    sincronizarSelectorServicio();
}

document.getElementById('ordenTipoTrabajoBusqueda').addEventListener('change', () => {
    if (modoOrdenTrabajo === 'vista') return;
    const value = document.getElementById('ordenTipoTrabajoBusqueda').value;
    tiposTrabajoOpciones().forEach(([id, nombre]) => { document.getElementById(id).checked = value.split(', ').includes(nombre); });
});
document.getElementById('ordenServicioBusqueda').addEventListener('input', () => { actualizarSugerenciasServicio(); seleccionarServicio(); });
document.getElementById('ordenServicioBusqueda').addEventListener('change', seleccionarServicio);

function sincronizarSelectorServicio() {
    const opciones = Array.from(document.getElementById('ordenServicios').options);
    const seleccion = opciones.filter(option => option.selected);
    const selector = document.getElementById('ordenServicioSelector');
    selector.innerHTML = '<option value="">Selecciona el servicio</option>' + opciones.map(option => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.textContent)}</option>`).join('');
    if (seleccion.length > 1) {
        const option = document.createElement('option'); option.value = 'historicos'; option.textContent = seleccion.map(item => item.textContent).join(', '); selector.append(option);
    }
    selector.value = seleccion.length > 1 ? 'historicos' : seleccion[0]?.value || '';
}
function abrirServicioManual(event) {
    if (modoOrdenTrabajo === 'vista') return;
    event?.preventDefault();
    const input = document.getElementById('ordenServicioBusqueda');
    document.getElementById('ordenServicioSelector').hidden = true;
    input.hidden = false; input.focus(); input.select?.();
}
document.getElementById('ordenServicioSelector').addEventListener('dblclick', abrirServicioManual);
document.getElementById('ordenServicioSelector').addEventListener('mousedown', event => { if (event.detail === 2) abrirServicioManual(event); });
document.getElementById('ordenServicioSelector').addEventListener('change', () => {
    if (modoOrdenTrabajo === 'vista') return;
    const value = document.getElementById('ordenServicioSelector').value;
    if (value === 'historicos') return;
    Array.from(document.getElementById('ordenServicios').options).forEach(option => { option.selected = String(option.value) === value; });
    renderOpcionesTrabajo();
});
document.getElementById('ordenServicioBusqueda').addEventListener('blur', () => {
    seleccionarServicio();
    const input = document.getElementById('ordenServicioBusqueda');
    if (input.validity && !input.validity.valid) return;
    input.hidden = true; document.getElementById('ordenServicioSelector').hidden = false;
});
document.getElementById('ordenServicioBusqueda').addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); seleccionarServicio(); if (event.target.reportValidity()) event.target.blur(); }
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); renderOpcionesTrabajo(); document.getElementById('ordenServicioSelector').focus(); }
});

document.getElementById('ordenSerie').addEventListener('input', event => { event.target.value = event.target.value.toUpperCase(); });
async function avanzarEstadoOrden(boton) {
    if (boton.disabled) return;
    boton.disabled = true;
    try {
        const orden = (await window.api.ordenes.list()).find(item => item.id === Number(boton.dataset.id));
        if (!orden || !['Abierta', 'En proceso'].includes(orden.estado)) { await cargarDatosOrdenes(); return; }
        const estado = orden.estado === 'Abierta' ? 'En proceso' : 'Finalizada';
        const hoy = new Date();
        const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
        const mensaje = estado === 'Finalizada' ? `Finalizar la orden ${orden.numero}? Se registrara la salida con fecha ${fecha} y se calcularan los mantenimientos.` : `Iniciar el trabajo de la orden ${orden.numero}?`;
        if (!await window.ui.confirm(mensaje, {title:'Estado de la orden', confirmText: estado === 'Finalizada' ? 'Finalizar' : 'Iniciar', tone:'success'})) return;
        const cambios = { ...orden, estado };
        if (estado === 'Finalizada') {
            cambios.fechaSalida = fecha;
            cambios.horaSalida = `${String(hoy.getHours()%12 || 12).padStart(2,'0')}:${String(hoy.getMinutes()).padStart(2,'0')}`;
            cambios.periodoSalida = hoy.getHours() >= 12 ? 'PM' : 'AM';
        }
        await window.api.ordenes.update(orden.id, cambios);
        await cargarDatosOrdenes();
    } catch (error) { await window.ui.alert(`No se pudo cambiar el estado: ${error.message}`); }
    finally { boton.disabled = false; }
}
