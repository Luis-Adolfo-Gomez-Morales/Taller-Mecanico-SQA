const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const tick = () => new Promise(resolve => setImmediate(resolve));
test('Confirmacion cancelable, avisos en cola y texto seguro', async () => {
    const dialogs = [];
    let focusRestored = 0;
    function element(tag) {
        return { tag, children: [], handlers: {}, classList: { add() {} },
            setAttribute() {}, addEventListener(name, fn) { this.handlers[name] = fn; },
            append(...children) { this.children.push(...children); }, focus() {},
            showModal() { this.open = true; }, close() { this.open = false; }, remove() { dialogs.splice(dialogs.indexOf(this), 1); }
        };
    }
    const ctx = vm.createContext({ window: {}, document: { activeElement: { isConnected: true, focus() { focusRestored++; } },
        createElement: element, body: { append(dialog) { dialogs.push(dialog); } } } });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/scripts/ui-dialogs.js'), 'utf8'), ctx);
    const confirmation = ctx.window.ui.confirm('Eliminar registro?');
    const alert = ctx.window.ui.alert('<b>Mensaje literal</b>');
    await tick(); assert.equal(dialogs.length, 1);
    dialogs[0].handlers.cancel({ preventDefault() {} });
    assert.equal(await confirmation, false);
    await tick(); assert.equal(dialogs.length, 1);
    assert.equal(dialogs[0].children[1].textContent, '<b>Mensaje literal</b>');
    assert.equal(dialogs[0].className, 'app-dialog is-danger');
    const actions = dialogs[0].children[2]; assert.equal(actions.children.length, 1);
    actions.children[0].handlers.click(); assert.equal(await alert, true);
    assert.equal(dialogs.length, 0); assert.equal(focusRestored, 2);
    const activation = ctx.window.ui.confirm('Activar?', { tone: 'success' });
    await tick();
    assert.equal(dialogs[0].className, 'app-dialog is-success');
    assert.equal(dialogs[0].children[2].children[1].className, 'app-dialog-accept is-success');
    dialogs[0].children[2].children[1].handlers.click();
    assert.equal(await activation, true);
});
