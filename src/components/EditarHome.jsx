import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { estaLogueado } from '../lib/auth';
import AdminLogin from './AdminLogin';

export default function EditarHome() {
  const [logueado, setLogueado] = useState(false);
  const [verificando, setVerificando] = useState(true);

  const [config, setConfig] = useState({
    hero_titulo: '',
    hero_descripcion: '',
    direccion: '',
    horarios: '',
    mision: '',
    servicio_1_titulo: '',
    servicio_1_descripcion: '',
    servicio_2_titulo: '',
    servicio_2_descripcion: '',
    servicio_3_titulo: '',
    servicio_3_descripcion: '',
    servicio_4_titulo: '',
    servicio_4_descripcion: '',
    whatsapp: '',
    instagram: '',
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    async function verificarSesion() {
      const activo = await estaLogueado();
      setLogueado(activo);
      setVerificando(false);
    }
    verificarSesion();
  }, []);

  // Carga idéntica a tu Home.jsx
  useEffect(() => {
    if (!logueado) return;

    async function cargarConfiguracion() {
      const { data, error } = await supabase
        .from('configuracion')
        .select('clave, valor');

      if (error) {
        console.error('Error cargando configuración:', error);
        setMensaje({ tipo: 'error', texto: `Error al cargar: ${error.message}` });
        setCargando(false);
        return;
      }

      if (data) {
        const configuracion = {};
        data.forEach((item) => {
          configuracion[item.clave] = item.valor || '';
        });
        setConfig((prev) => ({ ...prev, ...configuracion }));
      }

      setCargando(false);
    }

    cargarConfiguracion();
  }, [logueado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      // Guardamos clave por clave para evitar problemas con upsert si no hay Primary Key
      const promesas = Object.entries(config).map(([clave, valor]) =>
        supabase
          .from('configuracion')
          .upsert({ clave, valor }, { onConflict: 'clave' })
      );

      const resultados = await Promise.all(promesas);

      const algunError = resultados.find((res) => res.error);
      if (algunError) {
        throw algunError.error;
      }

      setMensaje({ tipo: 'exito', texto: '✨ ¡Cambios guardados con éxito! Ya se ven en la web.' });
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setMensaje({ tipo: 'error', texto: `Error al guardar: ${error.message || 'Revisá la consola.'}` });
    } finally {
      setGuardando(false);
    }
  };

  if (verificando) return null;
  if (!logueado) return <AdminLogin onLogin={() => setLogueado(true)} />;

  if (cargando) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px 20px' }}>
        <p className="section-title">Cargando panel de edición...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '850px', padding: '40px 20px' }}>
      
      {/* Encabezado del Panel */}
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <h2 className="section-title" style={{ marginBottom: '10px' }}>
          ✏️ Editar Página de Inicio
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#555' }}>
          Cambiá los textos de tu sitio web de forma simple. Modificá lo que necesites y presioná el botón al final.
        </p>
      </div>

      {/* Carteles de Feedback */}
      {mensaje.texto && (
        <div
          style={{
            padding: '15px 20px',
            marginBottom: '30px',
            borderRadius: '12px',
            fontWeight: '600',
            textAlign: 'center',
            backgroundColor: mensaje.tipo === 'exito' ? '#e6f4ea' : '#fce8e6',
            color: mensaje.tipo === 'exito' ? '#137333' : '#c5221f',
            border: `2px solid ${mensaje.tipo === 'exito' ? '#ceebd6' : '#f5c2c7'}`,
          }}
        >
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
        
        {/* SECCIÓN 1: PORTADA */}
        <div className="service-card" style={{ padding: '25px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '2rem' }}>🖼️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Portada Principal</h3>
              <small style={{ color: '#666' }}>Es lo primero que ven tus clientes al entrar a la página.</small>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>
              Título Principal:
              <input
                type="text"
                name="hero_titulo"
                value={config.hero_titulo}
                onChange={handleChange}
                placeholder="Ej: Tu salud comienza con una buena alimentación"
                style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </label>

            <label style={{ fontWeight: 'bold' }}>
              Texto de Bienvenida (Descripción):
              <textarea
                name="hero_descripcion"
                value={config.hero_descripcion}
                onChange={handleChange}
                rows="3"
                placeholder="Breve presentación de la dietética..."
                style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'inherit' }}
              />
            </label>
          </div>
        </div>

        {/* SECCIÓN 2: INFORMACIÓN DESTACADA */}
        <div className="service-card" style={{ padding: '25px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '2rem' }}>📌</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Información Útil</h3>
              <small style={{ color: '#666' }}>Ubicación, horarios de atención y misión del negocio.</small>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>
              📍 Dirección y Localidad:
              <input
                type="text"
                name="direccion"
                value={config.direccion}
                onChange={handleChange}
                placeholder="Ej: Diag 80 835 entre 3 y 4, La Plata"
                style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </label>

            <label style={{ fontWeight: 'bold' }}>
              🕑 Horarios de Atención:
              <input
                type="text"
                name="horarios"
                value={config.horarios}
                onChange={handleChange}
                placeholder="Ej: Lun-Vie 09-19hs | Sáb 09-13hs"
                style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </label>

            <label style={{ fontWeight: 'bold' }}>
              🌱 Nuestra Misión:
              <input
                type="text"
                name="mision"
                value={config.mision}
                onChange={handleChange}
                placeholder="Ej: Salud accesible para todos"
                style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </label>
          </div>
        </div>

        {/* SECCIÓN 3: SERVICIOS */}
        <div className="service-card" style={{ padding: '25px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '2rem' }}>⭐</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>¿Por qué elegirnos? (4 Tarjetas)</h3>
              <small style={{ color: '#666' }}>Los 4 puntos fuertes que destacan a tu negocio.</small>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* Tarjeta 1 */}
            <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '10px', border: '1px solid #eee' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', color: '#2e7d32' }}>🥗 Servicio 1</p>
              <input
                type="text"
                name="servicio_1_titulo"
                value={config.servicio_1_titulo}
                onChange={handleChange}
                placeholder="Título"
                style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                name="servicio_1_descripcion"
                value={config.servicio_1_descripcion}
                onChange={handleChange}
                placeholder="Descripción corta"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            {/* Tarjeta 2 */}
            <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '10px', border: '1px solid #eee' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', color: '#2e7d32' }}>🚚 Servicio 2</p>
              <input
                type="text"
                name="servicio_2_titulo"
                value={config.servicio_2_titulo}
                onChange={handleChange}
                placeholder="Título"
                style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                name="servicio_2_descripcion"
                value={config.servicio_2_descripcion}
                onChange={handleChange}
                placeholder="Descripción corta"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            {/* Tarjeta 3 */}
            <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '10px', border: '1px solid #eee' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', color: '#2e7d32' }}>💳 Servicio 3</p>
              <input
                type="text"
                name="servicio_3_titulo"
                value={config.servicio_3_titulo}
                onChange={handleChange}
                placeholder="Título"
                style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                name="servicio_3_descripcion"
                value={config.servicio_3_descripcion}
                onChange={handleChange}
                placeholder="Descripción corta"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            {/* Tarjeta 4 */}
            <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '10px', border: '1px solid #eee' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', color: '#2e7d32' }}>🎓 Servicio 4</p>
              <input
                type="text"
                name="servicio_4_titulo"
                value={config.servicio_4_titulo}
                onChange={handleChange}
                placeholder="Título"
                style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                name="servicio_4_descripcion"
                value={config.servicio_4_descripcion}
                onChange={handleChange}
                placeholder="Descripción corta"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

          </div>
        </div>

        {/* SECCIÓN 4: REDES Y CONTACTO */}
        <div className="service-card" style={{ padding: '25px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '2rem' }}>💬</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Contacto y Redes</h3>
              <small style={{ color: '#666' }}>Enlaces directos para que te contacten por chat o vean tu perfil.</small>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>
              📞 Número de WhatsApp:
              <span style={{ display: 'block', fontWeight: 'normal', fontSize: '0.85rem', color: '#666' }}>
                Ingresalo sin el signo + ni espacios (Ejemplo: 5492211234567).
              </span>
              <input
                type="text"
                name="whatsapp"
                value={config.whatsapp}
                onChange={handleChange}
                placeholder="5492211234567"
                style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </label>

            <label style={{ fontWeight: 'bold' }}>
              📱 Usuario de Instagram:
              <span style={{ display: 'block', fontWeight: 'normal', fontSize: '0.85rem', color: '#666' }}>
                Ingresalo sin el @ (Ejemplo: dieteticaintegrallp).
              </span>
              <input
                type="text"
                name="instagram"
                value={config.instagram}
                onChange={handleChange}
                placeholder="dieteticaintegrallp"
                style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </label>
          </div>
        </div>

        {/* Botón de Guardar Principal */}
        <button
          type="submit"
          className="cta-button"
          disabled={guardando}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1.2rem',
            textAlign: 'center',
            cursor: guardando ? 'not-allowed' : 'pointer',
            opacity: guardando ? 0.7 : 1,
            border: 'none',
          }}
        >
          {guardando ? 'Guardando cambios...' : '💾 Guardar Todo el Contenido'}
        </button>

      </form>
    </div>
  );
}