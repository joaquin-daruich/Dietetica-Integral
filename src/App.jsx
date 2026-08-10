import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import Home from './components/Home';
import Productos from './components/Productos';
import Checkout from './components/Checkout';
import Gracias from './components/Gracias';
import Pedidos from './components/Pedidos';
import Stock from './components/Stock';
import CarritoDrawer from './components/CarritoDrawer';
import './App2.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const { cantidadTotal } = useCart();

  return (
    <>
      <header className="header">
        <div className="container header-content">
          <div className="logo-section">
            <img src="/diet.jpg" alt="Dietética Integral Logo" className="logo-img" />
            <div className="logo-text">
              <h1>Dietética Integral</h1>
              <p className="tagline">Productos Saludables</p>
            </div>
          </div>

          <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
            <ul>
              <li>
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/productos" onClick={() => setIsMenuOpen(false)}>
                  Productos
                </Link>
              </li>
              <li>
                <a href="/#servicios" onClick={() => setIsMenuOpen(false)}>
                  Servicios
                </a>
              </li>
              <li>
                <a href="/#contacto" onClick={() => setIsMenuOpen(false)}>
                  Contacto
                </a>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            <button className="carrito-icono-btn" onClick={() => setCarritoAbierto(true)}>
              🛒
              {cantidadTotal > 0 && <span className="carrito-badge">{cantidadTotal}</span>}
            </button>
            <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ☰
            </button>
          </div>
        </div>
      </header>
      <CarritoDrawer abierto={carritoAbierto} onClose={() => setCarritoAbierto(false)} />
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <img src="/diet.jpg" alt="Logo Dietética Integral" className="footer-logo" />
          <p>Productos Saludables desde 2021</p>
        </div>

        <div className="footer-links">
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/productos">Productos</Link>
            </li>
            <li>
              <a href="/#contacto">Contacto</a>
            </li>
          </ul>
        </div>

        <div className="footer-social">
          <h4>Síguenos</h4>
          <div className="social-icons">
            <a href="https://instagram.com/dieteticaintegrallp" target="_blank" rel="noopener noreferrer">
              IG
            </a>
            <a href="https://wa.me/5492215929856" target="_blank" rel="noopener noreferrer">
              WA
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Dietética Integral. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/gracias" element={<Gracias />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/stock" element={<Stock />} />
          </Routes>
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
