// Login simple para el panel de administración (/pedidos y /stock).
//
// Nota: usamos sessionStorage en vez de localStorage. sessionStorage se comporta
// EXACTAMENTE como lo pediste ("que la sesión quede iniciada hasta que se cierre
// el navegador"): sobrevive a recargas y a navegar entre páginas, pero se borra
// solo al cerrar el navegador/pestaña. localStorage en cambio NO se borra solo
// (queda para siempre hasta borrar caché), así que sessionStorage es la opción
// correcta para lo que describiste.

const SESSION_KEY = 'dietetica_admin_session';
const USUARIO = 'dietetica';
const CLAVE = '2213';

export function iniciarSesion(usuario, clave) {
  if (usuario === USUARIO && clave === CLAVE) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    return true;
  }
  return false;
}

export function estaLogueado() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export function cerrarSesion() {
  sessionStorage.removeItem(SESSION_KEY);
}
