import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';

export default function Productos() {
  console.log('holaa')
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState(['Todos']);
  const [categoria, setCategoria] = useState('Todos');
  const [cargando, setCargando] = useState(true);
  const { agregar } = useCart();

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true);
      
      const [resProductos, resCategorias] = await Promise.all([
        supabase.from('productos').select('*').order('nombre', { ascending: true }),
        supabase.from('categorias').select('nombre').order('nombre', { ascending: true })
      ]);

      if (!resProductos.error && resProductos.data) {
        setProductos(resProductos.data);
      }

      if (!resCategorias.error && resCategorias.data) {
        const nombresCat = resCategorias.data.map((c) => c.nombre);
        setCategorias(['Todos', ...nombresCat]);
      }

      setCargando(false);
    }

    cargarDatos();
  }, []);

  const filtrados =
    categoria === 'Todos' ? productos : productos.filter((p) => p.categoria === categoria);

  return (
    <div className="productos-page container">
      <h1 className="section-title">Nuestros Productos</h1>
      <p className="section-subtitle">Suplementos, alimentos saludables y mucho más</p>
      <p className="promo-banner">
        🎓 Descuentos especiales para estudiantes y jubilados — consultanos por WhatsApp
      </p>

      {/* FILTRO DE CATEGORÍAS DINÁMICO */}
      <div className="categorias-filtro">
        {categorias.map((cat) => (
          <button
            key={cat}
            className={`filtro-btn ${categoria === cat ? 'active' : ''}`}
            onClick={() => setCategoria(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="productos-loading">Cargando productos...</p>
      ) : (
        <>
          <div className="productos-grid-tienda">
            {filtrados.map((producto) => (
              <div key={producto.id} className="producto-card-tienda">
                <div className="producto-img-wrap">
                  <img src={producto.imagen_url} alt={producto.nombre} loading="lazy" decoding="async" />
                  {producto.stock <= 0 && <span className="sin-stock-badge">Sin stock</span>}
                </div>
                <div className="producto-info">
                  <span className="producto-categoria">{producto.categoria}</span>
                  <h3>{producto.nombre}</h3>
                  <p className="producto-precio">${Number(producto.precio).toLocaleString('es-AR')}</p>
                  <button
                    className="agregar-btn"
                    disabled={producto.stock <= 0}
                    onClick={() => agregar(producto)}
                  >
                    {producto.stock <= 0 ? 'Sin stock' : 'Agregar al carrito 🛒'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filtrados.length === 0 && (
            <p className="sin-productos">No hay productos en esta categoría todavía.</p>
          )}
        </>
      )}
    </div>
  );
}