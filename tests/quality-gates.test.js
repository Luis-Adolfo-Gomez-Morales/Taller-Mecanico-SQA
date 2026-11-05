const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

test('Los controles rechazan advertencias y cobertura insuficiente', () => {
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    delete env.NODE_V8_COVERAGE;
    const lint = spawnSync(process.execPath, [require('node:path').join(require('node:path').dirname(require.resolve('eslint/package.json')), 'bin/eslint.js'), '--stdin', '--stdin-filename', 'src/ejemplo.js', '--max-warnings', '0'], {
        input: 'const variableSinUso = 1;\n', encoding: 'utf8', env, timeout: 30000
    });
    assert.equal(lint.status, 1);
    assert.match(lint.stdout + lint.stderr, /no-unused-vars/);
    const coverage = spawnSync(process.execPath, ['--test', '--experimental-test-coverage', '--test-coverage-include=src/scripts/cliente-validation.js', '--test-coverage-lines=100', 'tests/clientes.validation.test.js'], {
        encoding: 'utf8', env, timeout: 30000
    });
    assert.equal(coverage.status, 1);
    assert.match(coverage.stdout + coverage.stderr, /coverage|Coverage/);
});
