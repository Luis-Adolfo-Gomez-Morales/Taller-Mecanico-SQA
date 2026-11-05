// Validacion compartida por el formulario y el proceso que guarda en MySQL.
(function (root) {
    const campos = [
        ['tipoPersona', 'Tipo de persona', 10],
        ['nombre', 'Nombre', 150],
        ['dpi', 'DPI', 30],
        ['telefono', 'Telefono', 30],
        ['correo', 'Correo', 120],
        ['licencia', 'Licencia', 50],
        ['tipoLicencia', 'Tipo de licencia', 10],
        ['venceLicencia', 'Vence licencia', 10],
        ['direccion', 'Direccion', 255],
    ];

    function correoValido(correo) {
        const partes = correo.split('@');
        if (partes.length !== 2 || !partes[0] || /\s/.test(correo)) return false;
        const dominio = partes[1];
        const punto = dominio.lastIndexOf('.');
        return punto > 0 && punto < dominio.length - 1;
    }

    function validarCliente(value) {
        if (!value || typeof value !== 'object') throw new Error('Los datos del cliente son obligatorios.');
        const source = value;
        const cliente = {};
        for (const [key, label, max] of campos) {
            if (typeof source[key] !== 'string' || !source[key].trim()) {
                throw new Error(`Completa el campo ${label}.`);
            }
            cliente[key] = source[key].trim();
            if (cliente[key].length > max) throw new Error(`${label} admite como maximo ${max} caracteres.`);
        }
        if (!['Individual', 'Empresa'].includes(cliente.tipoPersona)) throw new Error('Selecciona un tipo de persona valido.');
        if (!correoValido(cliente.correo)) throw new Error('Ingresa un correo valido.');
        if (!['A', 'B', 'C', 'M'].includes(cliente.tipoLicencia)) throw new Error('Selecciona un tipo de licencia valido.');
        const fecha = new Date(cliente.venceLicencia + 'T00:00:00Z');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(cliente.venceLicencia) || Number(cliente.venceLicencia.slice(0, 4)) < 1000 ||
            !Number.isFinite(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== cliente.venceLicencia) {
            throw new Error('Ingresa una fecha de vencimiento valida.');
        }
        if (value.contactoEmpresa !== null && value.contactoEmpresa !== undefined && typeof value.contactoEmpresa !== 'string') {
            throw new Error('Contacto empresa debe ser texto o quedar vacio.');
        }
        cliente.contactoEmpresa = value.contactoEmpresa?.trim() || null;
        if (cliente.contactoEmpresa && cliente.contactoEmpresa.length > 150) {
            throw new Error('Contacto empresa admite como maximo 150 caracteres.');
        }
        cliente.licencia = cliente.licencia.toUpperCase();
        return cliente;
    }
    const api = { validarCliente, campos, correoValido };
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.clienteValidation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
