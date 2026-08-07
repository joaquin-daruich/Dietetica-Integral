import { useState } from 'react';
import { iniciarSesion } from '../lib/auth';

export default function AdminLogin({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (iniciarSesion(usuario, clave)) {
      onLogin();
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="admin-login container">
      <form className="contact-form admin-login-form" onSubmit={handleSubmit}>
        <h2>Acceso Administración</h2>
        <input placeholder="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        <input
          type="password"
          placeholder="Contraseña"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />
        {error && <p className="checkout-error">{error}</p>}
        <button type="submit" className="submit-btn">
          Ingresar
        </button>
      </form>
    </div>
  );
}
