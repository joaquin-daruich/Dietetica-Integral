import React from 'react'
import './App.css'

function App() {
console.log('holaa')
async function comprar() {
  const res = await fetch('/.netlify/functions/create-preference', {
    method: 'POST',
    body: JSON.stringify({ titulo: 'Libro de prueba', precio: 1000 }),
  });
  const data = await res.json();
  window.location.href = data.init_point;
}
  return (
    <>
      {/* BANNER PRINCIPAL */}
      <div className='banner'>
        <img className='foto-perfil' src="foto-perfil.jpg" alt="Jardín Secreto Libros" />
        <h1>Jardín Secreto Libros</h1>
      </div> 

      {/* INFORMACIÓN DEL LOCAL */}
      <div className='info-container'>
        <p><strong>Pequeña librería de barrio 📖</strong></p>
        <p>📍 Av. Perón 873 | San Fernando, Bs.As.</p>
        <p>🕒 Horario: Lunes a sábado de 9 a 13 y 15 a 19 hs</p>
        <p>🚚 Envíos a todo el país 🇦🇷</p>
        <p style={{ marginTop: '10px' }}>
          <a
            href="https://maps.google.com/?q=Av.+Per%C3%B3n+873,+San+Fernando,+Buenos+Aires"
            target="_blank"
            rel="noreferrer"
          >
            Ver ubicación en Google Maps
          </a>
        </p>
      </div>

      {/* DETALLE ESPECIAL: CLUB DE LECTURA (Copia fiel de su flyer para impactarlos) */}
      <div className='club-lectura-card'>
        <h2>Club de Lectura</h2>
        <p><em>¿Te gusta leer pero sentís que te falta un espacio para compartir lo que te pasa con la literatura?</em></p>
        
        <p className='club-subtitulo'>En Agosto leemos:</p>
        <p className='libro-destacado'>Pura Pasión</p>
        <p style={{ color: '#A98054' }}>de Annie Ernaux</p>

        <p style={{ marginTop: '15px', fontSize: '0.9rem' }}>
          📅 Miércoles 26 de Agosto | 18:00 hs a 19:30 hs <br/>
          Dictado por Valentina Benvenuto (UBA)
        </p>
      </div>

      {/* CATEGORÍAS SOLICITADAS */}
      <div className='productos'>
        <h2 className='section-title'>Nuestra Selección</h2>
        
        <div className='producto-grid'>
          <div className='producto-card'>
            <h3>Poesía</h3>
            <img src="1.jpg" alt="Libros de Poesía" />
          </div>

          <div className='producto-card'>
            <h3>Literatura Japonesa</h3>
            <img src="2.jpg" alt="Libros de Literatura Japonesa" />
          </div>

          <div className='producto-card'>
            <h3>Naturaleza & Botánica</h3>
            <img src="3.jpg" alt="Libros sobre Naturaleza" />
          </div>

          <div className='producto-card'>
            <h3>Novelas</h3>
            <img src="4.jpg" alt="Novelas" />
          </div>
          <button className='pedido-btn' onClick={comprar}>
  Comprar (prueba)
</button>

          <div className='producto-card'>
            <h3>Infantil & Juvenil</h3>
            <img src="5.jpg" alt="Libros Infantiles" />
          </div>
        </div>

        {/* SECCIÓN DE CONTACTO Y PEDIDOS */}
        <div className='pedido-card'>
          <h3>¿Buscás un libro en especial?</h3>
          <p>Consultanos por stock o encargá tu próximo libro.</p>
          <div className='pedido-botones'>
            <a
              className='pedido-btn'  
              href="https://www.instagram.com/jardinsecreto.libros"
              target="_blank"
              rel="noreferrer"
            >
              Instagram (@jardinsecreto.libros)
            </a>
            <a 
              className='pedido-btn' 
              href="https://wa.me/" 
              target="_blank" 
              rel="noreferrer"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>

      </div>
    </>
  )
}

export default App