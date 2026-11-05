const tablaVehiculos = document.getElementById('tablaVehiculos');
const buscarVehiculo = document.getElementById('buscarVehiculo');
const filtroEstadoVehiculo = document.getElementById('filtroEstadoVehiculo');
const filtroTipoIndicador = document.getElementById('filtroTipoIndicador');
const formVehiculo = document.getElementById('formVehiculo');
const modalVehiculo = document.getElementById('modalVehiculo');
const btnCerrarVehiculo = document.getElementById('btnCerrarVehiculo');
const btnGuardarVehiculo = document.getElementById('btnGuardarVehiculo');
const totalVehiculos = document.getElementById('totalVehiculos');
const vehiculosActivos = document.getElementById('vehiculosActivos');
const vehiculosTaller = document.getElementById('vehiculosTaller');
const vehiculosInactivos = document.getElementById('vehiculosInactivos');
const formFields = Array.from(formVehiculo.querySelectorAll('input, select'));
const vehiculoPlaca = document.getElementById('vehiculoPlaca');
const btnCambiarEstadoVehiculo = document.getElementById('btnCambiarEstadoVehiculo');

let modoRegistroVehiculo = 'nuevo';
let vehiculoSeleccionadoId = null;
let vehiculos = [];
let clientesDisponibles = [];
let estadoCargaVehiculos = 'Cargando datos...';
const clienteContextoId = Number(new URLSearchParams(window.location.search).get('cliente')) || null;
let guardandoVehiculo = false;



function formatKilometraje(value) {
    return `${Number(value || 0).toLocaleString('en-US')} km`;
}

function getFieldValue(id) {
    return document.getElementById(id).value.trim();
}

function setFieldValue(id, value = '') {
    document.getElementById(id).value = value ?? '';
}

function formatVehiclePlateInput(value) {
    const normalized = value.toUpperCase().replace(/\s+/g, '');

    if (/^[A-Z]$/.test(normalized)) {
        return `${normalized}-`;
    }

    if (/^[A-Z][^-]/.test(normalized)) {
        return `${normalized.charAt(0)}-${normalized.slice(1)}`;
    }

    return normalized;
}

// El buscador admite placas, nombres y modelos sin alterar sus espacios.
function formatVehicleSearchInput(value, deleting = false) {
    let text = value.replace(/^(\p{L})-(?=[\p{L}\s])/u, '$1');
    if (/^\p{L}$/u.test(text) && !deleting) return `${text.toUpperCase()}-`;
    if (/^\p{L}-?\d/u.test(text)) {
        text = text.replace(/^(\p{L})-?(?=\d)/u, (_, letter) => `${letter.toUpperCase()}-`);
    }
    return text;
}

function applyVehiclePlateFormat(input) {
    if (input.dataset.skipPlateFormat === 'true') {
        input.dataset.skipPlateFormat = 'false';
        input.value = input.value.toUpperCase().replace(/\s+/g, '');
        return;
    }

    const formattedValue = formatVehiclePlateInput(input.value);

    if (input.value !== formattedValue) {
        input.value = formattedValue;
    }
}

function setRegistroSoloLectura(isReadOnly) {
    formFields.forEach((field) => {
        field.disabled = isReadOnly;
    });

    btnGuardarVehiculo.hidden = isReadOnly;
    actualizarControlEstadoVehiculo();
    modalVehiculo.classList.toggle('is-readonly', isReadOnly);
}

function limpiarRegistroVehiculo() {
    formVehiculo.reset();
    vehiculoSeleccionadoId = null;
}

function abrirRegistroVehiculo() {
    const veniaDeVista = modoRegistroVehiculo !== 'nuevo';

    modoRegistroVehiculo = 'nuevo';
    vehiculoSeleccionadoId = null;
    setRegistroSoloLectura(false);

    if (veniaDeVista) {
        limpiarRegistroVehiculo();
    }

    modalVehiculo.classList.add('is-open');
    modalVehiculo.setAttribute('aria-hidden', 'false');
    vehiculoPlaca.focus();
}

function ocultarRegistroVehiculo() {
    if (clienteContextoId) {
        window.location.href = `pilotos.html?cliente=${encodeURIComponent(clienteContextoId)}`;
        return;
    }
    modalVehiculo.classList.remove('is-open');
    modalVehiculo.setAttribute('aria-hidden', 'true');
    buscarVehiculo.focus();
}

function getVehiculoFormulario() {
    const vehiculoActual = vehiculos.find((vehiculo) => vehiculo.id === vehiculoSeleccionadoId);

    return {
        placa: formatVehiclePlateInput(getFieldValue('vehiculoPlaca')),
        nit: getFieldValue('vehiculoNit'),
        cui: getFieldValue('vehiculoCui'),
        propietario: getFieldValue('vehiculoPropietario'),
        idCliente: vehiculoActual?.idCliente || clienteContextoId,
        nivelUso: getFieldValue('vehiculoNivelUso'),
        uso: document.getElementById('vehiculoUso').value,
        tipo: document.getElementById('vehiculoTipo').value,
        marca: getFieldValue('vehiculoMarca'),
        linea: getFieldValue('vehiculoLinea'),
        modelo: getFieldValue('vehiculoModelo'),
        color: getFieldValue('vehiculoColor'),
        chasis: getFieldValue('vehiculoChasis'),
        serie: getFieldValue('vehiculoSerie'),
        vin: getFieldValue('vehiculoVin'),
        motor: getFieldValue('vehiculoMotor'),
        asientos: Number(getFieldValue('vehiculoAsientos')) || 0,
        ejes: Number(getFieldValue('vehiculoEjes')) || 0,
        cilindros: Number(getFieldValue('vehiculoCilindros')) || 0,
        cc: Number(getFieldValue('vehiculoCc')) || 0,
        tonelaje: Number(getFieldValue('vehiculoTonelaje')) || 0,
        estado: modoRegistroVehiculo === 'edicion' ? vehiculoActual?.estado || 'Activo' : 'Activo',
        kilometraje: getFieldValue('vehiculoKilometraje')
    };
}

function cargarVehiculoEnFormulario(vehiculo) {
    setFieldValue('vehiculoPlaca', vehiculo.placa);
    setFieldValue('vehiculoNit', vehiculo.nit);
    setFieldValue('vehiculoCui', vehiculo.cui);
    setFieldValue('vehiculoPropietario', vehiculo.propietario);
    mostrarClienteEnEncabezado(vehiculo.idCliente, vehiculo.cliente);
    setFieldValue('vehiculoUso', vehiculo.uso);
    setFieldValue('vehiculoNivelUso', vehiculo.nivelUso);
    setFieldValue('vehiculoTipo', vehiculo.tipo);
    setFieldValue('vehiculoMarca', vehiculo.marca);
    setFieldValue('vehiculoLinea', vehiculo.linea);
    setFieldValue('vehiculoModelo', vehiculo.modelo);
    setFieldValue('vehiculoColor', vehiculo.color);
    setFieldValue('vehiculoChasis', vehiculo.chasis);
    setFieldValue('vehiculoSerie', vehiculo.serie);
    setFieldValue('vehiculoVin', vehiculo.vin);
    setFieldValue('vehiculoMotor', vehiculo.motor);
    setFieldValue('vehiculoAsientos', vehiculo.asientos ?? '');
    setFieldValue('vehiculoEjes', vehiculo.ejes ?? '');
    setFieldValue('vehiculoCilindros', vehiculo.cilindros ?? '');
    setFieldValue('vehiculoCc', vehiculo.cc ?? '');
    setFieldValue('vehiculoTonelaje', vehiculo.tonelaje ?? '');
    setFieldValue('vehiculoKilometraje', vehiculo.kilometraje ?? '');
}

function verDetalleVehiculo(index) {
    const vehiculo = getVehiculosFiltrados()[index];

    if (!vehiculo) {
        return;
    }

    modoRegistroVehiculo = 'vista';
    vehiculoSeleccionadoId = vehiculo.id;
    cargarVehiculoEnFormulario(vehiculo);
    setRegistroSoloLectura(true);
    modalVehiculo.classList.add('is-open');
    modalVehiculo.setAttribute('aria-hidden', 'false');
    btnCerrarVehiculo.focus();
}

function editarVehiculo(index) {
    const vehiculo = getVehiculosFiltrados()[index];

    if (!vehiculo) {
        return;
    }

    modoRegistroVehiculo = 'edicion';
    vehiculoSeleccionadoId = vehiculo.id;
    cargarVehiculoEnFormulario(vehiculo);
    setRegistroSoloLectura(false);
    modalVehiculo.classList.add('is-open');
    modalVehiculo.setAttribute('aria-hidden', 'false');
    vehiculoPlaca.focus();
}

function normalizarTipoVehiculo(tipo) {
    return String(tipo || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function getVehiculosPorTipoIndicador() {
    const tipo = filtroTipoIndicador.value;

    if (tipo === 'todos') {
        return vehiculos;
    }

    return vehiculos.filter((vehiculo) => normalizarTipoVehiculo(vehiculo.tipo) === normalizarTipoVehiculo(tipo));
}

function renderIndicadoresVehiculos() {
    if (estadoCargaVehiculos) { mostrarEstadoCargaVehiculos(); return; }
    const vehiculosIndicador = getVehiculosPorTipoIndicador();

    totalVehiculos.innerText = vehiculosIndicador.length;
    vehiculosActivos.innerText = vehiculosIndicador.filter((vehiculo) => vehiculo.estado === 'Activo').length;
    vehiculosTaller.innerText = vehiculosIndicador.filter((vehiculo) => vehiculo.estado === 'En taller').length;
    vehiculosInactivos.innerText = vehiculosIndicador.filter((vehiculo) => vehiculo.estado === 'Inactivo').length;
}

function getVehiculosFiltrados() {
    const textoBusqueda = buscarVehiculo.value.trim().replace(/^(\p{L})-$/u, '$1');
    const busqueda = normalizarTipoVehiculo(textoBusqueda);
    const estado = filtroEstadoVehiculo.value;

    return getVehiculosPorTipoIndicador().filter((vehiculo) => {
        const coincideBusqueda = [
            vehiculo.placa,
            vehiculo.tipo,
            vehiculo.modelo,
            vehiculo.marca,
            vehiculo.linea,
            vehiculo.cliente,
            vehiculo.propietario,
        ].filter(Boolean).some((valor) => normalizarTipoVehiculo(valor).includes(busqueda));
        const coincideEstado = estado === 'todos' || vehiculo.estado === estado;

        return coincideBusqueda && coincideEstado;
    }).sort(compareVehiculosPorPlaca);
}

function getPlateSortParts(placa = '') {
    const normalized = String(placa).toUpperCase();
    const inicio = normalized.match(/^([A-Z])-?(\d+)/);
    const resto = inicio ? normalized.slice(inicio[0].length) : '';
    if (!inicio || /[\r\n\u2028\u2029]/u.test(resto)) return { letra: '', numero: 0, resto: '' };
    const [, letra, numero] = inicio;

    return {
        letra,
        numero: Number(numero) || 0,
        resto
    };
}

function compareVehiculosPorPlaca(vehiculoA, vehiculoB) {
    const placaA = getPlateSortParts(vehiculoA.placa);
    const placaB = getPlateSortParts(vehiculoB.placa);
    const letraCompare = placaA.letra.localeCompare(placaB.letra);

    if (letraCompare !== 0) {
        return letraCompare;
    }

    if (placaA.numero !== placaB.numero) {
        return placaA.numero - placaB.numero;
    }

    return placaA.resto.localeCompare(placaB.resto);
}

function renderVehiculos() {
    if (estadoCargaVehiculos) { mostrarEstadoCargaVehiculos(); return; }
    const vehiculosFiltrados = getVehiculosFiltrados();

    tablaVehiculos.innerHTML = vehiculosFiltrados.map((vehiculo, index) => `
        <tr>
            <td>${escapeVehicleText(vehiculo.placa)}</td>
            <td>${escapeVehicleText(vehiculo.marca || '')}</td>
            <td>${escapeVehicleText(vehiculo.linea || '')}</td>
            <td>${escapeVehicleText(vehiculo.modelo || '')}</td>
            <td>${escapeVehicleText(vehiculo.tipo || '')}</td>
            <td>${escapeVehicleText(vehiculo.cliente || 'Sin cliente')}</td>
            <td><div class="vehicle-mileage"><span>${formatKilometraje(vehiculo.kilometraje)}</span><button class="icon-action js-kilometraje-vehiculo" type="button" data-id="${vehiculo.id}" title="Actualizar kilometraje" aria-label="Actualizar kilometraje"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button></div></td>
            <td class="vehicle-actions-cell">
                <div class="table-actions vehicle-actions">
                    <button class="icon-action js-ver-vehiculo" type="button" data-index="${index}" aria-label="Ver detalle de ${vehiculo.placa}">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="icon-action js-editar-vehiculo" type="button" data-index="${index}" aria-label="Editar ${vehiculo.placa}">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-action js-eliminar-vehiculo" type="button" data-id="${vehiculo.id}" aria-label="Eliminar ${vehiculo.placa}">
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

    if (vehiculosFiltrados.length === 0) {
        tablaVehiculos.innerHTML = `
            <tr>
                <td colspan="8" class="empty-row">No hay vehiculos con esos filtros.</td>
            </tr>
        `;
    }

    renderIndicadoresVehiculos();
}

async function cargarVehiculos() {
    estadoCargaVehiculos = 'Cargando datos...';
    mostrarEstadoCargaVehiculos();
    try {
        [vehiculos, clientesDisponibles] = await Promise.all([window.api.vehiculos.list(), window.api.pilotos.list()]);
        estadoCargaVehiculos = null;
        renderVehiculos();
        return true;
    } catch (error) {
        vehiculos = []; clientesDisponibles = [];
        estadoCargaVehiculos = 'No se pudieron cargar los datos. Revisa la conexion y vuelve a abrir el modulo.';
        mostrarEstadoCargaVehiculos();
        window.ui.alert(`No se pudieron cargar los vehiculos: ${error.message}`);
        return false;
    }
}

formVehiculo.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (modoRegistroVehiculo === 'vista' || guardandoVehiculo) {
        return;
    }

    try {
        if (!formVehiculo.reportValidity()) return;
        const vehiculo = getVehiculoFormulario();
        if (!vehiculo.idCliente) throw new Error('Abre el registro del vehiculo desde la ficha de un cliente.');
        guardandoVehiculo = true;
        btnGuardarVehiculo.disabled = true;

        if (modoRegistroVehiculo === 'edicion' && vehiculoSeleccionadoId) {
            await window.api.vehiculos.update(vehiculoSeleccionadoId, vehiculo);
        } else {
            await window.api.vehiculos.create(vehiculo);
        }

        if (clienteContextoId) {
            window.location.href = `pilotos.html?cliente=${encodeURIComponent(clienteContextoId)}`;
            return;
        }
        limpiarRegistroVehiculo();
        await cargarVehiculos();
        ocultarRegistroVehiculo();
    } catch (error) {
        window.ui.alert(`No se pudo guardar el vehiculo: ${error.message}`);
    } finally {
        guardandoVehiculo = false;
        btnGuardarVehiculo.disabled = false;
    }
});

function handleVehiclePlateKeydown(event) {
    if (event.key === 'Backspace' || event.key === 'Delete') {
        if (!event.target.value) {
            event.target.dataset.skipPlateFormat = 'false';
            return;
        }

        if (/^[A-Z]-$/.test(event.target.value.toUpperCase())) {
            event.preventDefault();
            event.target.value = '';
            event.target.dataset.skipPlateFormat = 'false';

            if (event.target === buscarVehiculo) {
                renderVehiculos();
            }

            return;
        }

        event.target.dataset.skipPlateFormat = 'true';
        return;
    }

    event.target.dataset.skipPlateFormat = 'false';
}

vehiculoPlaca.addEventListener('keydown', handleVehiclePlateKeydown);
vehiculoPlaca.addEventListener('input', () => {
    applyVehiclePlateFormat(vehiculoPlaca);
});
buscarVehiculo.addEventListener('input', (event) => {
    if (!event.isComposing) {
        const before = buscarVehiculo.value;
        const cursor = buscarVehiculo.selectionStart ?? before.length;
        const formatted = formatVehicleSearchInput(before, event.inputType?.startsWith('delete'));
        if (formatted !== before) {
            buscarVehiculo.value = formatted;
            const position = cursor === 0 ? 0 : Math.max(0, Math.min(formatted.length, cursor + formatted.length - before.length));
            buscarVehiculo.setSelectionRange?.(position, position);
        }
    }
    renderVehiculos();
});
filtroEstadoVehiculo.addEventListener('change', renderVehiculos);
filtroTipoIndicador.addEventListener('change', renderVehiculos);
btnCerrarVehiculo.addEventListener('click', ocultarRegistroVehiculo);
modalVehiculo.addEventListener('click', (event) => {
    if (event.target.hasAttribute('data-close-vehicle-modal')) {
        event.preventDefault();
    }
});
tablaVehiculos.addEventListener('click', async (event) => {
    const kilometrajeButton = event.target.closest('.js-kilometraje-vehiculo');
    if (kilometrajeButton) { editarKilometrajeFila(kilometrajeButton); return; }
    const detailButton = event.target.closest('.js-ver-vehiculo');
    const editButton = event.target.closest('.js-editar-vehiculo');
    const deleteButton = event.target.closest('.js-eliminar-vehiculo');

    if (detailButton) {
        verDetalleVehiculo(Number(detailButton.dataset.index));
    }

    if (editButton) {
        editarVehiculo(Number(editButton.dataset.index));
    }

    if (deleteButton && await window.ui.confirm('Desea eliminar este vehiculo?', { title: 'Eliminar registro', confirmText: 'Eliminar', danger: true })) {
        window.api.vehiculos.remove(Number(deleteButton.dataset.id))
            .then(cargarVehiculos)
            .catch((error) => window.ui.alert(`No se pudo eliminar el vehiculo: ${error.message}`));
    }
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalVehiculo.classList.contains('is-open')) {
        ocultarRegistroVehiculo();
    }
});

cargarVehiculos().then(async cargado => {
    if (!cargado) return;
    if (!clienteContextoId) return;
    const cliente = clientesDisponibles.find(c => c.id === clienteContextoId);
    if (!cliente) {
        await window.ui.alert('No se encontro el cliente. Vuelve a Clientes y selecciona un registro existente.');
        window.location.href = 'pilotos.html';
        return;
    }
    abrirRegistroVehiculo();
    mostrarClienteEnEncabezado(cliente.id, cliente.nombre);
}).catch(error => console.error('No se pudo completar la carga inicial:', error));

function escapeVehicleText(value) {
    return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function mostrarClienteEnEncabezado(idCliente, nombre = '') {
    const cliente = clientesDisponibles.find(item => item.id === idCliente);
    document.getElementById('vehiculoEncabezado').textContent =
        `Datos del vehiculo - ${cliente?.nombre || nombre || 'Sin cliente vinculado'}`;
}

function mostrarEstadoCargaVehiculos() {
    tablaVehiculos.innerHTML = '<tr><td colspan="8" class="empty-row"></td></tr>';
    tablaVehiculos.querySelector('td').textContent = estadoCargaVehiculos;
    [totalVehiculos, vehiculosActivos, vehiculosTaller, vehiculosInactivos].forEach(indicador => { indicador.innerText = '--'; });
}

function actualizarControlEstadoVehiculo() {
    const vehiculo = vehiculos.find(item => item.id === vehiculoSeleccionadoId);
    const visible = modoRegistroVehiculo === 'edicion' && Boolean(vehiculo);
    document.getElementById('vehiculoEstadoEdicion').hidden = !visible;
    if (!visible) return;
    const activar = vehiculo.estado === 'Inactivo';
    btnCambiarEstadoVehiculo.textContent = activar ? 'Activar' : 'Desactivar';
    btnCambiarEstadoVehiculo.className = `vehicle-state-toggle ${activar ? 'is-success' : 'is-danger'}`;
    btnCambiarEstadoVehiculo.title = `Estado actual: ${vehiculo.estado}`;
    btnCambiarEstadoVehiculo.setAttribute('aria-label', `${activar ? 'Activar' : 'Desactivar'} vehiculo ${vehiculo.placa}. Estado actual: ${vehiculo.estado}`);
}

btnCambiarEstadoVehiculo.addEventListener('click', async () => {
    if (modoRegistroVehiculo !== 'edicion' || guardandoVehiculo) return;
    const vehiculo = vehiculos.find(item => item.id === vehiculoSeleccionadoId);
    if (!vehiculo) return;
    const estado = vehiculo.estado === 'Inactivo' ? 'Activo' : 'Inactivo';
    guardandoVehiculo = true;
    btnCambiarEstadoVehiculo.disabled = true;
    btnGuardarVehiculo.disabled = true;
    try {
        if (!await window.ui.confirm(`Cambiar el vehiculo ${vehiculo.placa} a ${estado}?`, {
            title: 'Estado del vehiculo', confirmText: estado === 'Activo' ? 'Activar' : 'Desactivar',
            tone: estado === 'Activo' ? 'success' : 'danger'
        })) return;
        const actualizado = await window.api.vehiculos.setEstado(vehiculo.id, estado);
        Object.assign(vehiculo, actualizado);
        renderVehiculos();
        actualizarControlEstadoVehiculo();
    } catch (error) {
        await window.ui.alert(`No se pudo cambiar el estado: ${error.message}`, { title: 'Error al actualizar' });
    } finally {
        guardandoVehiculo = false;
        btnCambiarEstadoVehiculo.disabled = false;
        btnGuardarVehiculo.disabled = false;
    }
});

function editarKilometrajeFila(boton) {
    const vehiculo = vehiculos.find(item => item.id === Number(boton.dataset.id));
    if (!vehiculo) return;
    const contenedor = boton.closest('.vehicle-mileage');
    const original = Array.from(contenedor.childNodes);
    const input = document.createElement('input');
    input.type = 'number'; input.min = String(vehiculo.kilometraje); input.step = '0.01'; input.required = true;
    input.value = vehiculo.kilometraje; input.setAttribute('aria-label', 'Nuevo kilometraje');
    const guardar = document.createElement('button'), cancelar = document.createElement('button');
    guardar.type = cancelar.type = 'button'; guardar.className = cancelar.className = 'mileage-action';
    guardar.textContent = 'Guardar'; cancelar.textContent = 'Cancelar';
    const restaurar = () => contenedor.replaceChildren(...original);
    cancelar.addEventListener('click', restaurar);
    guardar.addEventListener('click', async () => {
        if (guardar.disabled || !input.reportValidity()) return;
        guardar.disabled = cancelar.disabled = input.disabled = true;
        try {
            const actualizado = await window.api.vehiculos.kilometraje(vehiculo.id, input.value);
            vehiculo.kilometraje = actualizado.kilometraje; renderVehiculos();
        } catch(error) { await window.ui.alert(error.message); }
        finally { guardar.disabled = cancelar.disabled = input.disabled = false; }
    });
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') { event.preventDefault(); guardar.click(); }
        if (event.key === 'Escape' && !guardar.disabled) { event.preventDefault(); event.stopPropagation(); restaurar(); }
    });
    contenedor.replaceChildren(input,guardar,cancelar); input.focus(); input.select();
}
