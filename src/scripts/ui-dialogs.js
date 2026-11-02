// Usar window.ui.alert / await window.ui.confirm para todos los avisos modales.
(() => {
    let queue = Promise.resolve();
    function show(message, options = {}, confirmation = false) {
        const task = () => new Promise(resolve => {
            const previousFocus = document.activeElement;
            const dialog = document.createElement('dialog');
            const requestedTone = options.danger ? 'danger' : (options.tone || (confirmation ? 'info' : 'danger'));
            const tone = ['danger', 'success', 'info'].includes(requestedTone) ? requestedTone : 'info';
            dialog.className = `app-dialog is-${tone}`;
            dialog.setAttribute('aria-labelledby', 'app-dialog-title');
            dialog.setAttribute('aria-describedby', 'app-dialog-message');
            const title = document.createElement('h2');
            title.id = 'app-dialog-title'; title.textContent = options.title || (confirmation ? 'Confirmar accion' : 'Aviso');
            const text = document.createElement('p');
            text.id = 'app-dialog-message'; text.textContent = String(message);
            const actions = document.createElement('div'); actions.className = 'app-dialog-actions';
            const accept = document.createElement('button');
            accept.type = 'button'; accept.className = `app-dialog-accept is-${tone}`;
            accept.textContent = options.confirmText || (confirmation ? 'Confirmar' : 'Aceptar');
            const cancel = document.createElement('button');
            cancel.type = 'button'; cancel.className = 'app-dialog-cancel'; cancel.textContent = 'Cancelar';
            let completed = false;
            function finish(value) {
                if (completed) return;
                completed = true; dialog.close(); dialog.remove();
                if (previousFocus?.isConnected) previousFocus.focus();
                resolve(value);
            }
            accept.addEventListener('click', () => finish(true));
            cancel.addEventListener('click', () => finish(false));
            dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
            // Escape cierra solo el aviso, no el formulario que esta debajo.
            dialog.addEventListener('keydown', event => { event.stopPropagation(); });
            if (confirmation) actions.append(cancel);
            actions.append(accept); dialog.append(title, text, actions);
            document.body.append(dialog); dialog.showModal();
            (confirmation ? cancel : accept).focus();
        });
        const result = queue.then(task);
        queue = result.catch(() => {});
        return result;
    }
    window.ui = Object.freeze({
        alert: (message, options) => show(message, options),
        confirm: (message, options) => show(message, options, true)
    });
})();
