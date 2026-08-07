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

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">Lo que dicen nuestros clientes</h2>
          <div className="testimonials-slider">
            {testimonials.map((t, index) => (
              <div key={index} className="testimonial-slide active">
                <p className="testimonial-text">"{t.text}"</p>
                <p className="testimonial-author">- {t.name}</p>
              </div>
            ))}
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
                      href="https://bit.ly/3OIUSQE"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      bit.ly/3OIUSQE
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <div>
                  <strong>Email</strong>
                  <p>dieteticaintegral@example.com</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon">📱</span>
                <div>
                  <strong>Instagram</strong>
                  <p>@dieteticaintegrallp</p>
                </div>
              </div>
            </div>
          </div>

          <form className="contact-form">
            <input type="text" placeholder="Tu nombre" />
            <input type="email" placeholder="Tu email" />
            <textarea placeholder="Tu mensaje..." rows="5"></textarea>
            <button type="submit" className="submit-btn">
              Enviar Mensaje
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
