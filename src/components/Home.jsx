import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [config, setConfig] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarConfiguracion() {
      const { data, error } = await supabase
        .from('configuracion')
        .select('clave, valor');

      console.log('CONFIG:', data);
      console.log('ERROR CONFIG:', error);

      if (error) {
        console.error('Error cargando configuración:', error);
        setCargando(false);
        return;
      }

      const configuracion = {};

      data.forEach((item) => {
        configuracion[item.clave] = item.valor;
      });

      setConfig(configuracion);
      setCargando(false);
    }

    cargarConfiguracion();
  }, []);

  if (cargando) {
    return <p>Cargando...</p>;
  }

  return (
    <>
      {/* Hero Section */}

      <section id="inicio" className="hero">
        <div className="container hero-content">

          <div className="hero-text">

            <h2>
              {config.hero_titulo}
            </h2>

            <p>
              {config.hero_descripcion}
            </p>

            <div className="hero-botones">

              <Link
                to="/productos"
                className="cta-button"
              >
                Ver catálogo 🛒
              </Link>

              <a
                href={`https://wa.me/${config.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button cta-secundario"
              >
                Contactar por WhatsApp 💬
              </a>

            </div>

          </div>

          <div className="hero-image">
            <div className="hero-card">
              <img
                src="/diet1.jpg"
                alt="Productos saludables"
              />
            </div>
          </div>

        </div>
      </section>


      {/* Info Banner */}

      <section className="info-banner">
        <div className="container info-grid">

          <div className="info-item">
            <span className="icon">📍</span>

            <div>
              <h3>Ubicación</h3>
              <p>{config.direccion}</p>
            </div>
          </div>


          <div className="info-item">
            <span className="icon">🕑</span>

            <div>
              <h3>Horarios</h3>
              <p>{config.horarios}</p>
            </div>
          </div>


          <div className="info-item">
            <span className="icon">🌱</span>

            <div>
              <h3>Nuestra Misión</h3>
              <p>{config.mision}</p>
            </div>
          </div>

        </div>
      </section>


      {/* Servicios Section */}

      <section id="servicios" className="services">
        <div className="container">

          <h2 className="section-title">
            ¿Por qué elegirnos?
          </h2>

          <div className="services-grid">

            <div className="service-card">
              <span className="service-icon">🥗</span>

              <h3>
                {config.servicio_1_titulo}
              </h3>

              <p>
                {config.servicio_1_descripcion}
              </p>
            </div>


            <div className="service-card">
              <span className="service-icon">🚚</span>

              <h3>
                {config.servicio_2_titulo}
              </h3>

              <p>
                {config.servicio_2_descripcion}
              </p>
            </div>


            <div className="service-card">
              <span className="service-icon">💳</span>

              <h3>
                {config.servicio_3_titulo}
              </h3>

              <p>
                {config.servicio_3_descripcion}
              </p>
            </div>


            <div className="service-card">
              <span className="service-icon">🎓</span>

              <h3>
                {config.servicio_4_titulo}
              </h3>

              <p>
                {config.servicio_4_descripcion}
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* Contacto Section */}

      <section id="contacto" className="contact">

        <div className="container contact-content">

          <div className="contact-info">

            <h2>Contáctanos</h2>

            <p>
              Estamos aquí para ayudarte con tus objetivos de salud
            </p>


            <div className="contact-details">

              {/* WhatsApp */}

              <div className="contact-item">

                <span className="contact-icon">
                  📞
                </span>

                <div>

                  <strong>
                    Teléfono/WhatsApp
                  </strong>

                  <p>

                    <a
                      href={`https://wa.me/${config.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {config.whatsapp}
                    </a>

                  </p>

                </div>

              </div>


              {/* Instagram */}

              <div className="contact-item">

                <span className="contact-icon">
                  📱
                </span>

                <div>

                  <strong>
                    Instagram
                  </strong>

                  <p>

                    <a
                      href={`https://www.instagram.com/${config.instagram}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      @{config.instagram}
                    </a>

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </>
  );
}