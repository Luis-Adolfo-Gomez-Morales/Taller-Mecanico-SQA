const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { _electron } = require('playwright');

test('Recorrido completo de la aplicacion con MySQL real', { timeout: 180000 }, async t => {
    assert(process.env.DB_NAME?.endsWith('_sqa_test'), 'Usa una base separada de pruebas.');
    const env = { ...process.env };
    delete env.ELECTRON_RUN_AS_NODE;
    const folder = path.resolve('reports/e2e');
    fs.mkdirSync(folder, { recursive: true });
    const args = ['.', `--user-data-dir=${folder}/profile-${process.pid}`];
    if (process.platform === 'linux') args.push('--no-sandbox');
    const app = await _electron.launch({ args, env });
    const page = await app.firstWindow();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    t.after(async () => {
        await page.screenshot({ path: path.join(folder, 'resultado.png') }).catch(() => {});
        await app.close();
    });
    const suffix = String(Date.now()).slice(-9);
    const nombre = 'Cliente UI ' + suffix;
    const placa = 'P-' + suffix;
    const mecanico = 'Mecanico UI ' + suffix;
    const pieza = 'Pieza UI ' + suffix;
    const paso = async (name, action) => {
        console.log(name);
        await action();
    };
    const ir = async file => {
        for (const id of ['btnCerrarPiloto', 'btnCerrarVehiculo', 'btnCerrarOrdenTrabajo', 'btnCerrarRepuesto']) {
            const close = page.locator('#' + id);
            if (await close.isVisible()) await close.click();
        }
        await page.locator(`a.nav-button[href="${file}.html"]`).click();
        await page.waitForURL(`**/${file}.html`);
    };
    const llenar = async values => {
        for (const [id, value] of Object.entries(values)) await page.locator('#' + id).fill(value);
    };

    await paso('Inicio de sesion rechaza datos incorrectos y permite entrar', async () => {
        await llenar({ usuario: 'usuario_sqa', password: 'incorrecta' });
        await page.locator('#btnLogin').click();
        await page.locator('#mensaje').filter({ hasText: 'incorrectos' }).waitFor();
        await page.locator('#password').fill('clave-solo-de-prueba');
        await page.locator('#btnLogin').click();
        await page.waitForURL('**/dashboard.html');
        await page.locator('#indicador-vehiculos').filter({ hasText: /^\d+$/ }).waitFor();
        await page.screenshot({ path: path.join(folder, 'inicio.png') });
    });

    await paso('Cliente y vehiculo se guardan desde sus formularios', async () => {
        await ir('pilotos');
        await page.locator('#btnNuevoPiloto').click();
        await page.locator('#clienteTipoPersona').selectOption('Individual');
        await llenar({ pilotoNombre: nombre, pilotoDpi: '7000' + suffix,
            pilotoTelefono: '55551234', pilotoCorreo: 'ui@example.com', pilotoLicencia: 'L-' + suffix,
            pilotoVenceLicencia: '2030-12-31', pilotoDireccion: 'Direccion de prueba' });
        await page.locator('#pilotoTipoLicencia').selectOption('C');
        await page.locator('#btnGuardarPiloto').click();
        await page.locator('#modalPiloto').waitFor({ state: 'hidden' });
        await page.locator('#buscarPiloto').fill(nombre);
        await page.locator('.js-editar-piloto').click();
        await page.locator('#btnAgregarVehiculoCliente').click();
        await page.waitForURL('**/vehiculos.html?cliente=*');
        await llenar({ vehiculoPlaca: placa, vehiculoPropietario: nombre,
            vehiculoMarca: 'Prueba', vehiculoModelo: 'Modelo UI', vehiculoKilometraje: '100' });
        await page.locator('#vehiculoTipo').selectOption('Camion');
        await page.locator('#btnGuardarVehiculo').click();
        await page.waitForURL('**/pilotos.html?cliente=*');
        await ir('vehiculos');
        await page.locator('#buscarVehiculo').fill(placa);
        await page.locator('tr').filter({ hasText: placa }).waitFor();
        await page.screenshot({ path: path.join(folder, 'vehiculo.png') });
    });

    await paso('La pantalla rechaza bajar kilometraje y conserva la edicion valida', async () => {
        await page.locator('.js-editar-vehiculo').click();
        await page.locator('#vehiculoKilometraje').fill('99');
        await page.locator('#btnGuardarVehiculo').click();
        await page.locator('#app-dialog-message').filter({ hasText: 'menor' }).waitFor();
        await page.locator('.app-dialog-accept').click();
        await page.locator('#vehiculoKilometraje').fill('110');
        await page.locator('#btnGuardarVehiculo').click();
        await page.locator('#modalVehiculo').waitFor({ state: 'hidden' });
        const vehicle = await page.evaluate(async plate => (await window.api.vehiculos.list()).find(v => v.placa === plate), placa);
        assert.equal(Number(vehicle.kilometraje), 110);
    });

    await paso('Mecanico y repuesto se registran desde la interfaz', async () => {
        await ir('mecanicos');
        await llenar({ mecanico_nombre: mecanico, mecanico_edad: '30', mecanico_dpi: '8000' + suffix,
            mecanico_correo: 'mecanico-ui@example.com', mecanico_direccion: 'Direccion de prueba',
            mecanico_fecha_contratacion: '2026-01-01' });
        await page.locator('#formMecanico button[type="submit"]').click();
        await page.locator('#tablaMecanicos tr').filter({ hasText: mecanico }).waitFor();
        await ir('repuestos');
        await page.locator('#btnNuevoRepuesto').click();
        await llenar({ repuestoCodigo: 'UI' + suffix, repuestoNombre: pieza,
            repuestoExistencia: '10', repuestoCosto: '25' });
        await page.locator('#formRepuesto button[type="submit"]').click();
        await page.locator('#modalRepuesto').waitFor({ state: 'hidden' });
        await page.locator('#buscarRepuesto').fill(pieza);
        await page.locator('tr').filter({ hasText: pieza }).waitFor();
    });

    await paso('Una orden finalizada guarda servicio y descuenta repuestos una sola vez', async () => {
        await ir('ordenes-trabajo');
        await page.locator('#btnNuevaOrdenTrabajo').click();
        await llenar({ ordenNumero: suffix, ordenFechaEntrada: '2026-11-04', ordenHoraEntrada: '08:00',
            ordenFechaSalida: '2026-11-04', ordenHoraSalida: '09:00', ordenPlaca: placa,
            ordenKilometraje: '110', ordenTrabajos: 'Revision de prueba desde la pantalla' });
        const option = page.locator('#ordenMecanico option').filter({ hasText: mecanico });
        await option.waitFor({ state: 'attached' });
        await page.locator('#ordenMecanico').selectOption(await option.getAttribute('value'));
        await page.locator('#ordenServicioSelector').selectOption({ label: 'Revision de ejemplo' });
        await page.locator('#ordenEstado').selectOption('Finalizada');
        await page.locator('#ordenRepuestoBusqueda').fill(pieza);
        await page.locator('#ordenRepuestoCantidad').fill('2');
        await page.locator('#btnAgregarRepuestoOrden').click();
        await page.locator('#btnGuardarOrdenTrabajo').click();
        await page.locator('#modalOrdenTrabajo').waitFor({ state: 'hidden' });
        await page.locator('#buscarOrdenTrabajo').fill(suffix);
        await page.locator('tr').filter({ hasText: suffix }).waitFor();
        await page.locator('.js-editar-orden').click();
        await page.locator('#ordenObservaciones').fill('Edicion sin nuevo consumo');
        await page.locator('#btnGuardarOrdenTrabajo').click();
        await page.locator('#modalOrdenTrabajo').waitFor({ state: 'hidden' });
        const part = await page.evaluate(async name => (await window.api.repuestos.list()).find(r => r.nombre === name), pieza);
        assert.equal(Number(part.existencia), 8);
        await page.screenshot({ path: path.join(folder, 'orden.png') });
    });

    await paso('Historial y panel muestran la atencion registrada sin errores de pantalla', async () => {
        await ir('historial');
        await page.locator('#historialBuscar').fill(placa);
        await page.locator('#historialTabla tr').filter({ hasText: placa }).first().waitFor();
        await page.screenshot({ path: path.join(folder, 'historial.png') });
        await ir('dashboard');
        await page.locator('#tablaServiciosInicio tr').filter({ hasText: placa }).waitFor();
        assert.deepEqual(errors, []);
        await page.screenshot({ path: path.join(folder, 'mantenimiento.png') });
    });
});
