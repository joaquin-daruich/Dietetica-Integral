import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { estaLogueado, cerrarSesion } from '../lib/auth';
import AdminLogin from './AdminLogin';

const CATEGORIAS = ['Proteínas', 'Alimentos', 'Vitaminas', 'Bebidas', 'Snacks', 'Deportivo'];

export default function Stock() {
const [logueado, setLogueado] = useState(false);

useEffect(() => {
  async function verificarSesion() {
    const activo = await estaLogueado();
    setLogueado(activo);
  }

  verificarSesion();
}, []);  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nuevo, setNuevo] = useState({ nombre: '', categoria: CATEGORIAS[0], precio: '', stock: '' });
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!logueado) return;
    cargarProductos();
  }, [logueado]);

  async function cargarProductos() {
    setCargando(true);
    const { data } = await supabase.from('productos').select('*').order('nombre');
    setProductos(data || []);
    setCargando(false);
  }

  async function actualizarStock(id, stock) {
    await supabase.from('productos').update({ stock }).eq('id', id);
    cargarProductos();
  }

  async function eliminarProducto(id) {
    if (!window.confirm('¿Eliminar este producto?')) return;
    await supabase.from('productos').delete().eq('id', id);
    cargarProductos();
  }

  async function agregarProducto(e) {
    e.preventDefault();
    setErrorMsg('');
    if (!nuevo.nombre || !nuevo.precio || !nuevo.stock) {
      setErrorMsg('Completá nombre, precio y stock.');
      return;
    }
    setSubiendo(true);
    try {
      let imagen_url = '';
      if (archivo) {
        const nombreArchivo = `${Date.now()}-${archivo.name}`;
        const { error: errorSubida } = await supabase.storage
          .from('productos')
          .upload(nombreArchivo, archivo);
        if (errorSubida) throw errorSubida;
        const { data: urlData } = supabase.storage.from('productos').getPublicUrl(nombreArchivo);
        imagen_url = urlData.publicUrl;
      }
      const { data: sessionData } = await supabase.auth.getSession();

console.log("SESION AL INSERT:", sessionData.session);

      const { error } = await supabase.from('productos').insert({
        nombre: nuevo.nombre,
        categoria: nuevo.categoria,
        precio: Number(nuevo.precio),
        stock: Number(nuevo.stock),
        imagen_url,
      });
      if (error) throw error;

      setNuevo({ nombre: '', categoria: CATEGORIAS[0], precio: '', stock: '' });
      setArchivo(null);
      cargarProductos();
    } catch (err) {
      setErrorMsg('No se pudo agregar el producto: ' + err.message);
    } finally {
      setSubiendo(false);
    }
  }

  if (!logueado) return <AdminLogin onLogin={() => setLogueado(true)} />;

  return (
    <div className="stock-page container">
      <div className="admin-header">
        <h2>Gestión de Stock</h2>
        <button
          className="cerrar-sesion-btn"
          onClick={() => {
            cerrarSesion();
            setLogueado(false);
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <form className="contact-form agregar-producto-form" onSubmit={agregarProducto}>
        <h3>Agregar nuevo producto</h3>
        <input
          placeholder="Nombre del producto"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
        />
        <select value={nuevo.categoria} onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Precio"
          value={nuevo.precio}
          onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
        />
        <input
          type="number"
          placeholder="Stock"
          value={nuevo.stock}
          onChange={(e) => setNuevo({ ...nuevo, stock: e.target.value })}
        />
        <input type="file" accept="image/*" onChange={(e) => setArchivo(e.target.files[0])} />
        {errorMsg && <p className="checkout-error">{errorMsg}</p>}
        <button type="submit" className="submit-btn" disabled={subiendo}>
          {subiendo ? 'Guardando...' : 'Agregar producto'}
        </button>
      </form>

      <h3 className="stock-lista-titulo">Productos actuales</h3>
      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <div className="stock-lista">
          {productos.map((p) => (
            <div key={p.id} className="stock-item">
              {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} />}
              <div className="stock-item-info">
                <strong>{p.nombre}</strong>
                <span>
                  {p.categoria} — ${Number(p.precio).toLocaleString('es-AR')}
                </span>
              </div>
              <input
                type="number"
                className="stock-input"
                value={p.stock}
                onChange={(e) => actualizarStock(p.id, Number(e.target.value))}
              />
              <button className="eliminar-producto-btn" onClick={() => eliminarProducto(p.id)}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
