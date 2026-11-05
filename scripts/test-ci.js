const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
fs.mkdirSync('reports', { recursive: true });
fs.mkdirSync('coverage', { recursive: true });
const tests = fs.readdirSync('tests').filter(file => file.endsWith('.test.js')).map(file => 'tests/' + file);
if (process.env.RUN_DB_TESTS === '1') tests.push('tests/maintenance.integration.js');
const result = spawnSync(process.execPath, [
    '--test', '--experimental-test-coverage',
    '--test-coverage-include=src/**/*.js', '--test-coverage-exclude=src/db-config*.js',
    '--test-coverage-lines=60',
    '--test-reporter=spec', '--test-reporter-destination=stdout',
    '--test-reporter=lcov', '--test-reporter-destination=coverage/lcov.info', ...tests
], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
const log = (result.stdout || '') + (result.stderr || '');
fs.writeFileSync('reports/tests.txt', log);
process.stdout.write(log);
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
