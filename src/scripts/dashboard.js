function hasAuthenticatedUser() {
    try {
        const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
        return Boolean(user?.id && user?.usuario);
    } catch {
        return false;
    }
}

if (!hasAuthenticatedUser()) {
    window.location.replace('login.html');
}

const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const tablaServiciosInicio = document.getElementById('tablaServiciosInicio');
const sidebarStateKey = 'sidebarCollapsed';

if (sidebar && sidebarToggle) {
    const savedSidebarState = localStorage.getItem(sidebarStateKey);
    const startsCollapsed = savedSidebarState === 'true';

    sidebar.classList.toggle('collapsed', startsCollapsed);
    sidebarToggle.setAttribute(
        'aria-label',
        startsCollapsed ? 'Expandir menu' : 'Contraer menu'
    );
    sidebarToggle.setAttribute('aria-expanded', String(!startsCollapsed));

    sidebarToggle.addEventListener('click', () => {
        const isCollapsed = sidebar.classList.toggle('collapsed');

        localStorage.setItem(sidebarStateKey, String(isCollapsed));
        sidebarToggle.setAttribute(
            'aria-label',
            isCollapsed ? 'Expandir menu' : 'Contraer menu'
        );
        sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
    });
}


async function cargarDashboard() {
    if (!tablaServiciosInicio) return;
    try {
        const data = await window.api.dashboard.get();
        for (const key of ['vehiculos', 'proximos', 'vencidos', 'atendidos', 'enProceso']) {
            document.getElementById('indicador-' + key).textContent = data[key];
        }
        tablaServiciosInicio.replaceChildren(...data.servicios.map(servicio => {
            const tr = document.createElement('tr');
            if (servicio.estado_alerta === 'Servicio pasado') tr.classList.add('maintenance-overdue');
            const valores = [servicio.placa, servicio.vehiculo, servicio.servicio, servicio.fecha_proximo_servicio,
                (servicio.dias_restantes === null || servicio.dias_restantes === undefined) ? 'Sin fecha' : servicio.dias_restantes < 0 ? `Vencido hace ${Math.abs(servicio.dias_restantes)} dias` : servicio.dias_restantes === 0 ? 'Hoy' : `${servicio.dias_restantes} dias`,
                (servicio.kilometraje_proximo === null || servicio.kilometraje_proximo === undefined) ? 'Sin referencia' : `${Number(servicio.kilometraje_proximo).toLocaleString()} km`,
                (servicio.kilometros_restantes === null || servicio.kilometros_restantes === undefined) ? 'Sin referencia' : servicio.kilometros_restantes < 0 ? `Excedido por ${Math.abs(servicio.kilometros_restantes).toLocaleString()} km` : `${Number(servicio.kilometros_restantes).toLocaleString()} km`, servicio.estado_alerta === 'Proximo' ? 'Próximo' : servicio.estado_alerta];
            valores.forEach((valor, index) => {
                const td = document.createElement('td');
                if (index === valores.length - 1) {
                    const estado = document.createElement('span');
                    const colores = {Pendiente: 'pending', Proximo: 'upcoming', Urgente: 'urgent', 'Servicio pasado': 'urgent'};
                    estado.className = `maintenance-status ${colores[servicio.estado_alerta] || ''}`;
                    estado.textContent = valor; td.append(estado);
                } else td.textContent = valor ?? '';
                tr.append(td);
            });
            return tr;
        }));
        document.getElementById('dashboardMensaje').textContent = data.servicios.length ? '' : 'No hay mantenimientos programados.';
    } catch (error) {
        for (const key of ['vehiculos', 'proximos', 'vencidos', 'atendidos', 'enProceso']) document.getElementById('indicador-' + key).textContent = '--';
        tablaServiciosInicio.replaceChildren();
        document.getElementById('dashboardMensaje').textContent = `No se pudo cargar el panel: ${error.message}`;
    }
}
if (tablaServiciosInicio) {
    cargarDashboard().catch(error => console.error('No se pudo completar la carga inicial:', error));
    setInterval(cargarDashboard, 60000);
    window.addEventListener('focus', cargarDashboard);
}
