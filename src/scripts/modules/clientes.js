const tablaPilotos = document.getElementById('tablaPilotos');
const buscarPiloto = document.getElementById('buscarPiloto');
const filtroEstadoPiloto = document.getElementById('filtroEstadoPiloto');
const filtroTipoLicenciaPiloto = document.getElementById('filtroTipoLicenciaPiloto');
const formPiloto = document.getElementById('formPiloto');
const btnNuevoPiloto = document.getElementById('btnNuevoPiloto');
const modalPiloto = document.getElementById('modalPiloto');
const btnCerrarPiloto = document.getElementById('btnCerrarPiloto');
const btnGuardarPiloto = document.getElementById('btnGuardarPiloto');
const totalPilotos = document.getElementById('totalPilotos');
const pilotosActivos = document.getElementById('pilotosActivos');
const pilotosDisponibles = document.getElementById('pilotosDisponibles');
const pilotosInactivos = document.getElementById('pilotosInactivos');
const pilotoFormFields = Array.from(formPiloto.querySelectorAll('input, select'));
const btnAgregarVehiculoCliente = document.getElementById('btnAgregarVehiculoCliente');
const clienteVehiculosVinculados = document.getElementById('clienteVehiculosVinculados');

const pendienteAsignar = 'Sin vehiculos registrados';
let modoRegistroPiloto = 'nuevo';
let pilotoSeleccionadoId = null;
let pilotos = [];
let estadoCargaClientes = 'Cargando datos...';
let guardandoCliente = false;

function getEstadoPilotoClass(estado) {
    if (estado === 'Activo') {
        return 'normal';
    }

    if (estado === 'Disponible') {
        return 'medium';
    }

    return 'high';
}

function formatFechaPiloto(value) {
    if (!value) {
        return 'Sin fecha';
    }

    const [year, month, day] = value.split('-');

    return `${day}/${month}/${year}`;
}

function getPilotoFieldValue(id) {
    return document.getElementById(id).value.trim();
}

function setPilotoFieldValue(id, value = '') {
    document.getElementById(id).value = value ?? '';
}

function escapeAttribute(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[character]));
}

function mostrarVehiculosCliente(cliente) {
    const vehiculos = cliente?.vehiculos || [];
    clienteVehiculosVinculados.replaceChildren(...(vehiculos.length ? vehiculos : [{ placa: 'Sin vehiculos registrados' }]).map(vehiculo => {
        const item = document.createElement('li');
        item.textContent = [vehiculo.placa, vehiculo.modelo].filter(Boolean).join(' - ');
        return item;
    }));
}

function agregarVehiculoDeCliente(id) {
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) return;
    window.location.href = `vehiculos.html?cliente=${encodeURIComponent(id)}`;
}

function setRegistroPilotoSoloLectura(isReadOnly) {
    pilotoFormFields.forEach((field) => {
        field.disabled = isReadOnly;
    });

    btnGuardarPiloto.hidden = isReadOnly;
    btnAgregarVehiculoCliente.hidden = isReadOnly;
    btnAgregarVehiculoCliente.type = 'submit';
    btnAgregarVehiculoCliente.textContent = 'Guardar y agregar vehiculo';
    modalPiloto.classList.toggle('is-readonly', isReadOnly);
}

function limpiarRegistroPiloto() {
    formPiloto.reset();
    mostrarVehiculosCliente(null);
    pilotoSeleccionadoId = null;
}

function abrirRegistroPiloto() {
    const veniaDeVista = modoRegistroPiloto !== 'nuevo';

    modoRegistroPiloto = 'nuevo';
    pilotoSeleccionadoId = null;
    setRegistroPilotoSoloLectura(false);

    if (veniaDeVista) {
        limpiarRegistroPiloto();
    }

    modalPiloto.classList.add('is-open');
    modalPiloto.setAttribute('aria-hidden', 'false');
    document.getElementById('pilotoNombre').focus();
}

function ocultarRegistroPiloto() {
    modalPiloto.classList.remove('is-open');
    modalPiloto.setAttribute('aria-hidden', 'true');
    btnNuevoPiloto.focus();
}

function getPilotoFormulario() {
    return {
        tipoPersona: getPilotoFieldValue('clienteTipoPersona'),
        contactoEmpresa: getPilotoFieldValue('clienteContactoEmpresa'),
        nombre: getPilotoFieldValue('pilotoNombre'),
        dpi: getPilotoFieldValue('pilotoDpi'),
        telefono: getPilotoFieldValue('pilotoTelefono'),
        correo: getPilotoFieldValue('pilotoCorreo'),
        licencia: getPilotoFieldValue('pilotoLicencia').toUpperCase(),
        tipoLicencia: document.getElementById('pilotoTipoLicencia').value,
        venceLicencia: document.getElementById('pilotoVenceLicencia').value,
        direccion: getPilotoFieldValue('pilotoDireccion'),
    };
}

function cargarPilotoEnFormulario(piloto) {
    setPilotoFieldValue('clienteTipoPersona', piloto.tipoPersona);
    setPilotoFieldValue('clienteContactoEmpresa', piloto.contactoEmpresa);
    setPilotoFieldValue('pilotoNombre', piloto.nombre);
    setPilotoFieldValue('pilotoDpi', piloto.dpi);
    setPilotoFieldValue('pilotoTelefono', piloto.telefono);
    setPilotoFieldValue('pilotoCorreo', piloto.correo);
    setPilotoFieldValue('pilotoLicencia', piloto.licencia);
    setPilotoFieldValue('pilotoTipoLicencia', piloto.tipoLicencia);
    setPilotoFieldValue('pilotoVenceLicencia', piloto.venceLicencia);
    mostrarVehiculosCliente(piloto);
    setPilotoFieldValue('pilotoDireccion', piloto.direccion);
}

function verDetallePiloto(index) {
    const piloto = getPilotosFiltrados()[index];

    if (!piloto) {
        return;
    }

    modoRegistroPiloto = 'vista';
    pilotoSeleccionadoId = piloto.id;
    cargarPilotoEnFormulario(piloto);
    setRegistroPilotoSoloLectura(true);
    modalPiloto.classList.add('is-open');
    modalPiloto.setAttribute('aria-hidden', 'false');
    btnCerrarPiloto.focus();
}

function editarPiloto(index) {
    const piloto = getPilotosFiltrados()[index];

    if (!piloto) {
        return;
    }

    modoRegistroPiloto = 'edicion';
    pilotoSeleccionadoId = piloto.id;
    cargarPilotoEnFormulario(piloto);
    setRegistroPilotoSoloLectura(false);
    modalPiloto.classList.add('is-open');
    modalPiloto.setAttribute('aria-hidden', 'false');
    document.getElementById('pilotoNombre').focus();
}

function getPilotosPorTipoLicencia() {
    const tipoLicencia = filtroTipoLicenciaPiloto.value;

    if (tipoLicencia === 'todos') {
        return pilotos;
    }

    return pilotos.filter((piloto) => piloto.tipoLicencia === tipoLicencia);
}

function renderIndicadoresPilotos() {
    if (estadoCargaClientes) { mostrarEstadoCargaPilotos(); return; }
    const pilotosIndicador = getPilotosPorTipoLicencia();

    totalPilotos.innerText = pilotosIndicador.length;
    pilotosActivos.innerText = pilotosIndicador.filter((piloto) => piloto.estado === 'Activo').length;
    pilotosDisponibles.innerText = pilotosIndicador.filter((piloto) => piloto.tipoPersona === 'Empresa').length;
    pilotosInactivos.innerText = pilotosIndicador.filter((piloto) => piloto.estado === 'Inactivo').length;
}

function getPilotosFiltrados() {
    const busqueda = buscarPiloto.value.trim().toLowerCase();
    const estado = filtroEstadoPiloto.value;

    return getPilotosPorTipoLicencia().filter((piloto) => {
        const coincideBusqueda = [
            piloto.nombre,
            piloto.tipoPersona,
            piloto.contactoEmpresa,
            piloto.dpi,
            piloto.telefono,
            piloto.correo,
            piloto.licencia,
            piloto.tipoLicencia,
            piloto.vehiculo
        ].filter(Boolean).some((valor) => String(valor).toLowerCase().includes(busqueda));
        const coincideEstado = estado === 'todos' || piloto.estado === estado;

        return coincideBusqueda && coincideEstado;
    });
}

function renderPilotos() {
    if (estadoCargaClientes) { mostrarEstadoCargaPilotos(); return; }
    const pilotosFiltrados = getPilotosFiltrados();

    tablaPilotos.innerHTML = pilotosFiltrados.map((piloto, index) => `
        <tr>
            <td>${escapeAttribute(piloto.nombre)}</td>
            <td>${escapeAttribute(piloto.licencia)} / ${escapeAttribute(piloto.tipoLicencia)}</td>
            <td>${escapeAttribute(piloto.telefono)}</td>
            <td>${escapeAttribute(piloto.vehiculo || pendienteAsignar)}</td>
            <td><span class="status ${getEstadoPilotoClass(piloto.estado)}">${escapeAttribute(piloto.estado)}</span></td>
            <td>${formatFechaPiloto(piloto.venceLicencia)}</td>
            <td class="vehicle-actions-cell">
                <div class="table-actions">
                    <button class="icon-action js-ver-piloto" type="button" data-index="${index}" aria-label="Ver detalle de ${escapeAttribute(piloto.nombre)}">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="icon-action js-editar-piloto" type="button" data-index="${index}" aria-label="Editar ${escapeAttribute(piloto.nombre)}">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-action js-eliminar-piloto" type="button" data-id="${piloto.id}" aria-label="Eliminar ${escapeAttribute(piloto.nombre)}">
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

    if (pilotosFiltrados.length === 0) {
        tablaPilotos.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">No hay clientes con esos filtros.</td>
            </tr>
        `;
    }

    renderIndicadoresPilotos();
}

async function cargarPilotos() {
    estadoCargaClientes = 'Cargando datos...';
    mostrarEstadoCargaPilotos();
    try {
        pilotos = await window.api.pilotos.list();
        estadoCargaClientes = null;
        renderPilotos();
        return true;
    } catch (error) {
        pilotos = [];
        estadoCargaClientes = 'No se pudieron cargar los datos. Revisa la conexion y vuelve a abrir el modulo.';
        mostrarEstadoCargaPilotos();
        window.ui.alert(`No se pudieron cargar los clientes: ${error.message}`);
        return false;
    }
}

formPiloto.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (modoRegistroPiloto === 'vista' || guardandoCliente) return;
    const agregarVehiculo = event.submitter === btnAgregarVehiculoCliente;
    try {
        pilotoFormFields.forEach(field => { field.value = field.value.trim(); });
        if (!formPiloto.reportValidity()) return;
        const piloto = window.clienteValidation.validarCliente(getPilotoFormulario());
        guardandoCliente = true;
        btnGuardarPiloto.disabled = true;
        btnAgregarVehiculoCliente.disabled = true;
        const guardado = modoRegistroPiloto === 'edicion' && pilotoSeleccionadoId
            ? await window.api.pilotos.update(pilotoSeleccionadoId, piloto)
            : await window.api.pilotos.create(piloto);
        // Guardar primero al propietario: cancelar el vehiculo no pierde sus datos.
        pilotoSeleccionadoId = guardado.id;
        modoRegistroPiloto = 'edicion';
        if (agregarVehiculo) {
            agregarVehiculoDeCliente(guardado.id);
            return;
        }
        limpiarRegistroPiloto();
        await cargarPilotos();
        ocultarRegistroPiloto();
    } catch (error) {
        window.ui.alert(`No se pudo guardar el cliente: ${error.message}`);
    } finally {
        guardandoCliente = false;
        btnGuardarPiloto.disabled = false;
        btnAgregarVehiculoCliente.disabled = false;
    }
});

buscarPiloto.addEventListener('input', renderPilotos);
filtroEstadoPiloto.addEventListener('change', renderPilotos);
filtroTipoLicenciaPiloto.addEventListener('change', renderPilotos);
btnNuevoPiloto.addEventListener('click', abrirRegistroPiloto);
btnCerrarPiloto.addEventListener('click', ocultarRegistroPiloto);
modalPiloto.addEventListener('click', (event) => {
    if (event.target.hasAttribute('data-close-pilot-modal')) {
        event.preventDefault();
    }
});
tablaPilotos.addEventListener('click', async (event) => {
    const detailButton = event.target.closest('.js-ver-piloto');
    const editButton = event.target.closest('.js-editar-piloto');
    const deleteButton = event.target.closest('.js-eliminar-piloto');

    if (detailButton) {
        verDetallePiloto(Number(detailButton.dataset.index));
    }

    if (editButton) {
        editarPiloto(Number(editButton.dataset.index));
    }

    if (deleteButton && await window.ui.confirm('Desea eliminar este cliente?', { title: 'Eliminar registro', confirmText: 'Eliminar', danger: true })) {
        window.api.pilotos.remove(Number(deleteButton.dataset.id))
            .then(cargarPilotos)
            .catch((error) => window.ui.alert(`No se pudo eliminar el cliente: ${error.message}`));
    }
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalPiloto.classList.contains('is-open')) {
        ocultarRegistroPiloto();
    }
});

mostrarVehiculosCliente(null);
cargarPilotos().then(cargado => {
    if (!cargado) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('nuevo') === '1') abrirRegistroPiloto();
    const id = Number(params.get('cliente'));
    if (id > 0) {
        const index = getPilotosFiltrados().findIndex(cliente => cliente.id === id);
        if (index >= 0) verDetallePiloto(index);
    }
});

// Mantener indicadores, filtros y tabla al dia aunque la pantalla quede abierta.
let actualizandoEstadosClientes = false;
async function actualizarEstadosClientes() {
    if (actualizandoEstadosClientes || document.hidden) return;
    actualizandoEstadosClientes = true;
    try {
        pilotos = await window.api.pilotos.list();
        estadoCargaClientes = null;
        renderPilotos();
        if (modoRegistroPiloto === 'vista') mostrarVehiculosCliente(pilotos.find(c => c.id === pilotoSeleccionadoId));
    } catch (error) {
        pilotos = [];
        estadoCargaClientes = 'No se pudieron actualizar los clientes. Revisa la conexion.';
        mostrarEstadoCargaPilotos();
        console.error('No se pudo actualizar el estado de los clientes:', error.message);
    } finally { actualizandoEstadosClientes = false; }
}
setInterval(actualizarEstadosClientes, 60000);
window.addEventListener('focus', actualizarEstadosClientes);
document.addEventListener('visibilitychange', actualizarEstadosClientes);

function mostrarEstadoCargaPilotos() {
    tablaPilotos.innerHTML = '<tr><td colspan="7" class="empty-row"></td></tr>';
    tablaPilotos.querySelector('td').textContent = estadoCargaClientes;
    [totalPilotos, pilotosActivos, pilotosDisponibles, pilotosInactivos].forEach(indicador => { indicador.innerText = '--'; });
}
