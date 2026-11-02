const loginForm = document.getElementById('loginForm');
const usuarioInput = document.getElementById('usuario');
const passwordInput = document.getElementById('password');
const mensaje = document.getElementById('mensaje');
const btnLogin = document.getElementById('btnLogin');

function mostrarMensaje(texto, tipo = 'error') {
    mensaje.textContent = texto;
    mensaje.style.color = tipo === 'error' ? 'red' : 'green';
}

if (!loginForm || !usuarioInput || !passwordInput || !mensaje || !btnLogin) {
    console.error('No se encontraron los elementos necesarios para el inicio de sesión.');
} else {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usuario = usuarioInput.value.trim();
        const password = passwordInput.value;

        if (!usuario || !password) {
            mostrarMensaje('Ingresa tu usuario y contraseña.');
            return;
        }

        if (!window.api?.auth?.login) {
            mostrarMensaje('No está disponible la conexión de inicio de sesión. Reinicia la aplicación.');
            return;
        }

        try {
            btnLogin.disabled = true;
            btnLogin.textContent = 'Validando...';
            mostrarMensaje('');

            const user = await window.api.auth.login(usuario, password);

            if (user) {
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'dashboard.html';
                return;
            }

            mostrarMensaje('Usuario o contraseña incorrectos, o el usuario está inactivo.');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            mostrarMensaje(`No se pudo consultar la base de datos: ${error.message}`);
        } finally {
            btnLogin.disabled = false;
            btnLogin.textContent = 'Ingresar';
        }
    });
}
