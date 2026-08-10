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
  const [editando, setEditando] = useState(null);




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
async function guardarEdicion(e) {
  e.preventDefault();

  if (!editando) return;

  try {
    let imagen_url = editando.imagen_url;

    // Si seleccionó una foto nueva
    if (editando.archivo) {
      const nombreArchivo = `${Date.now()}-${editando.archivo.name}`;

      const { error: errorSubida } = await supabase.storage
        .from('productos')
        .upload(nombreArchivo, editando.archivo);

      if (errorSubida) throw errorSubida;

      const { data: urlData } = supabase.storage
        .from('productos')
        .getPublicUrl(nombreArchivo);

      imagen_url = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('productos')
      .update({
        nombre: editando.nombre,
        categoria: editando.categoria,
        precio: Number(editando.precio),
        stock: Number(editando.stock),
        imagen_url
      })
      .eq('id', editando.id)
      .select()
      .single();

    if (error) throw error;

    // Actualiza solamente ese producto en pantalla
    setProductos((productosActuales) =>
      productosActuales.map((producto) =>
        producto.id === editando.id
          ? data
          : producto
      )
    );

    // Cerrar edición
    setEditando(null);

  } catch (error) {
    console.error('Error editando producto:', error);
    alert('No se pudo modificar el producto: ' + error.message);
  }
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

    {editando?.id === p.id ? (

      // =========================
      // MODO EDITAR
      // =========================

      <form
        className="editar-producto"
        onSubmit={guardarEdicion}
      >

        <h4>Editar producto</h4>

        {p.imagen_url && (
          <img
            src={
              editando.archivo
                ? URL.createObjectURL(editando.archivo)
                : p.imagen_url
            }
            alt={p.nombre}
          />
        )}

        <input
          type="text"
          placeholder="Nombre"
          value={editando.nombre}
          onChange={(e) =>
            setEditando({
              ...editando,
              nombre: e.target.value
            })
          }
        />

        <input
          type="number"
          placeholder="Precio"
          value={editando.precio}
          onChange={(e) =>
            setEditando({
              ...editando,
              precio: e.target.value
            })
          }
        />

        <select
          value={editando.categoria}
          onChange={(e) =>
            setEditando({
              ...editando,
              categoria: e.target.value
            })
          }
        >
          {CATEGORIAS.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Stock"
          value={editando.stock}
          onChange={(e) =>
            setEditando({
              ...editando,
              stock: e.target.value
            })
          }
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setEditando({
              ...editando,
              archivo: e.target.files[0]
            })
          }
        />

        <button
          type="submit"
          className="submit-btn"
        >
          💾 Guardar cambios
        </button>

        <button
          type="button"
          className="cancelar-edicion-btn"
          onClick={() => setEditando(null)}
        >
          Cancelar
        </button>

      </form>

    ) : (

      // =========================
      // MODO NORMAL
      // =========================

      <>
        {p.imagen_url && (
          <img
            src={p.imagen_url}
            alt={p.nombre}
          />
        )}

        <div className="stock-item-info">

          <strong>{p.nombre}</strong>

          <span>
            {p.categoria} — $
            {Number(p.precio).toLocaleString('es-AR')}
          </span>

          <span>
            Stock: {p.stock}
          </span>

        </div>

        <button
          className="editar-producto-btn"
          onClick={() =>
            setEditando({
              id: p.id,
              nombre: p.nombre,
              categoria: p.categoria,
              precio: p.precio,
              stock: p.stock,
              imagen_url: p.imagen_url,
              archivo: null
            })
          }
        >
          ✏️ Editar producto
        </button>

        <button
          className="eliminar-producto-btn"
          onClick={() => eliminarProducto(p.id)}
        >
          🗑️
        </button>

      </>

    )}

  </div>
))}
        </div>
      )}
    </div>
  );
}
