import { Link } from 'react-router-dom';

const testimonials = [
  { name: 'María G.', text: 'Los mejores productos saludables de La Plata' },
  { name: 'Carlos R.', text: 'Excelente atención y variedad increíble' },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section id="inicio" className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h2>Tu salud comienza con una buena alimentación</h2>
            <p>
              En Dietética Integral encontrarás los mejores productos naturales
              y saludables para cuidar tu bienestar.
            </p>
            <div className="hero-botones">
              <Link to="/productos" className="cta-button">
                Ver catálogo 🛒
              </Link>
              <a
                href="https://bit.ly/3OIUSQE"
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
              <img src="/diet1.jpg" alt="Productos saludables" />
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
              <p>Diag 80 835 entre 3 y 4, La Plata</p>
            </div>
          </div>
          <div className="info-item">
            <span className="icon">🕑</span>
            <div>
              <h3>Horarios</h3>
              <p>Lun-Vie 09-19hs | Sáb 09-13hs</p>
            </div>
          </div>
          <div className="info-item">
            <span className="icon">🌱</span>
            <div>
              <h3>Nuestra Misión</h3>
              <p>Salud accesible para todos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container stats-grid">
          <div className="stat-item">
            <span className="stat-number">1,206+</span>
            <span className="stat-label">Clientes Felices</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Productos Naturales</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">106</span>
            <span className="stat-label">Productos Destacados</span>
          </div>
        </div>
      </section>

      {/* Servicios Section */}
      <section id="servicios" className="services">
        <div className="container">
          <h2 className="section-title">¿Por qué elegirnos?</h2>
          <div className="services-grid">
            <div className="service-card">
              <span className="service-icon">🥗</span>
              <h3>Asesoramiento Nutricional</h3>
              <p>Orientación personalizada para tus necesidades</p>
            </div>
            <div className="service-card">
              <span className="service-icon">🚚</span>
              <h3>Envíos Rápidos</h3>
              <p>Entrega en tiempo récord en La Plata y alrededores</p>
            </div>
            <div className="service-card">
              <span className="service-icon">💳</span>
              <h3>Múltiples Formas de Pago</h3>
              <p>Facilidades para tu comodidad</p>
            </div>
            <div className="service-card">
              <span className="service-icon">🎓</span>
              <h3>Promos Estudiantes y Jubilados</h3>
              <p>Descuentos especiales, consultanos por WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

    

      {/* Contacto Section */}
      <section id="contacto" className="contact">
        <div className="container contact-content">
          <div className="contact-info">
            <h2>Contáctanos</h2>
            <p>Estamos aquí para ayudarte con tus objetivos de salud</p>

            <div className="contact-details">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div>
                  <strong>Teléfono/WhatsApp</strong>
                  <p>
                    <a
                      href="https://wa.me/5492215929856"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                     +54 9 2215 92-9856
                    </a>
                  </p>
                </div>
              </div>

             

              <div className="contact-item">
                <span className="contact-icon">📱</span>
                <div>
                  <strong>Instagram</strong>
                  <p>
                                      <a
                      href="https://www.instagram.com/dieteticaintegrallp/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                     @dieteticaintegrallp
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
