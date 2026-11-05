const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function archivos(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? archivos(file) : [file];
    });
}
const files = ['main.js', 'eslint.config.js', ...archivos('src'), ...archivos('scripts'), ...archivos('tests')];
for (const file of files.filter(file => file.endsWith('.js'))) execFileSync(process.execPath, ['--check', file]);
fs.mkdirSync('build', { recursive: true });
// La entrega contiene el codigo necesario, sin la configuracion personal.
fs.cpSync('src', 'build/src', { recursive: true, filter: file => path.basename(file) !== 'db-config.js' });
for (const file of ['main.js', 'package.json', 'package-lock.json', 'README.md']) fs.copyFileSync(file, path.join('build', file));
console.log('Build listo: sintaxis revisada y carpeta de entrega preparada.');
