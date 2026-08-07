
import { useState } from 'react';
import { iniciarSesion } from '../lib/auth';

export default function AdminLogin({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setCargando(true);

    const correcto = await iniciarSesion(usuario, clave);

    if (correcto) {
      onLogin();
    } else {
      setError('Usuario o contraseña incorrectos');
    }

    setCargando(false);
  };

  return (
    <div className="admin-login container">
      <form
        className="contact-form admin-login-form"
        onSubmit={handleSubmit}
      >
        <h2>Acceso Administración</h2>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          required
        />

        {error && <p className="checkout-error">{error}</p>}

        <button
          type="submit"
          className="submit-btn"
          disabled={cargando}
        >
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
