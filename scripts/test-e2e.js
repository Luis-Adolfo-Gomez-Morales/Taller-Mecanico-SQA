const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

fs.mkdirSync('reports', { recursive: true });
const result = spawnSync(process.execPath, ['--test', 'tests/electron.e2e.js'], {
    encoding: 'utf8', maxBuffer: 10 * 1024 * 1024
});
const output = (result.stdout || '') + (result.stderr || '');
fs.writeFileSync('reports/e2e.txt', output);
process.stdout.write(output);
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
