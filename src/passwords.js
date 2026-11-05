const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');

const deriveKey = promisify(scrypt);
const options = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const prefix = 'scrypt$32768$8$3$';

function passwordValido(password) {
    return typeof password === 'string' && password.length > 0 && Buffer.byteLength(password, 'utf8') <= 1024;
}

async function hashPassword(password) {
    if (!passwordValido(password)) throw new Error('La clave debe tener entre 1 y 1024 bytes.');
    const salt = randomBytes(16).toString('hex');
    const key = await deriveKey(password, salt, 64, options);
    return `${prefix}${salt}$${key.toString('hex')}`;
}

async function verifyPassword(password, stored) {
    if (!passwordValido(password) || typeof stored !== 'string' || !stored) return false;
    if (stored.startsWith('scrypt$')) {
        if (!stored.startsWith(prefix)) return false;
        const parts = stored.slice(prefix.length).split('$');
        if (parts.length !== 2 || !/^[a-f0-9]{32}$/.test(parts[0]) || !/^[a-f0-9]{128}$/.test(parts[1])) return false;
        const key = await deriveKey(password, parts[0], 64, options);
        return timingSafeEqual(key, Buffer.from(parts[1], 'hex'));
    }
    // La clave antigua solo se acepta para poder reemplazarla al iniciar sesion.
    const input = Buffer.from(password, 'utf8');
    const previous = Buffer.from(stored, 'utf8');
    return input.length === previous.length && timingSafeEqual(input, previous);
}

module.exports = { hashPassword, verifyPassword };
