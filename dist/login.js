const formularioLogin = document.querySelector('#formulario-login');
const mensajeLogin = document.querySelector('#mensaje-login');

// Si ya tenía sesión iniciada, pasa directo al panel.
db.auth.getSession().then(({ data }) => {
  if (data.session) window.location.href = 'admin.html';
});

formularioLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!formularioLogin.reportValidity()) return;

  const boton = formularioLogin.querySelector('button[type="submit"]');
  boton.disabled = true;
  mensajeLogin.hidden = true;

  const { error } = await db.auth.signInWithPassword({
    email: document.querySelector('#correo').value.trim(),
    password: document.querySelector('#contrasena').value
  });

  if (error) {
    mensajeLogin.textContent = 'Correo o contraseña incorrectos.';
    mensajeLogin.hidden = false;
    boton.disabled = false;
    return;
  }
  window.location.href = 'admin.html';
});