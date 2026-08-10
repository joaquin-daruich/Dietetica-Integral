import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { estaLogueado, cerrarSesion } from '../lib/auth';
import AdminLogin from './AdminLogin';

export default function Stock() {
  const [logueado, setLogueado] = useState(false);

  // Productos y Búsqueda
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');

  // Categorías
  const [categorias, setCategorias] = useState([]);
  const [nuevaCatInput, setNuevaCatInput] = useState('');
  const [catAEditar, setCatAEditar] = useState('');
  const [nuevoNombreCat, setNuevoNombreCat] = useState('');

  // Formularios
  const [cargando, setCargando] = useState(true);
  const [nuevo, setNuevo] = useState({ nombre: '', categoria: '', precio: '', stock: '' });
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    async function verificarSesion() {
      const activo = await estaLogueado();
      setLogueado(activo);
    }
    verificarSesion();
  }, []);

  useEffect(() => {
    if (!logueado) return;
    cargarProductos();
  }, [logueado]);

  async function cargarProductos() {
    setCargando(true);
    const { data, error } = await supabase.from('productos').select('*').order('nombre');
    
    if (!error && data) {
      setProductos(data);
      extraerCategorias(data);
    }
    setCargando(false);
  }

  // Extrae de forma dinámica las categorías únicas desde la columna 'categoria'
  function extraerCategorias(listaProductos) {
    const categoriasUnicas = Array.from(
      new Set(
        listaProductos
          .map((p) => p.categoria)
          .filter((cat) => cat && cat.trim() !== '')
      )
    ).sort();

    const categoriasFinales = categoriasUnicas.length > 0 
      ? categoriasUnicas 
      : ['Proteínas', 'Alimentos', 'Vitaminas', 'Bebidas', 'Snacks', 'Deportivo'];

    setCategorias(categoriasFinales);

    setNuevo((prev) => ({
      ...prev,
      categoria: prev.categoria || categoriasFinales[0] || ''
    }));
  }

  // AGREGAR NUEVA CATEGORÍA
  function agregarNuevaCategoria(e) {
    e.preventDefault();
    const nombreLimpio = nuevaCatInput.trim();
    if (!nombreLimpio) return;

    if (!categorias.includes(nombreLimpio)) {
      const nuevaLista = [...categorias, nombreLimpio].sort();
      setCategorias(nuevaLista);
    }

    setNuevo((prev) => ({ ...prev, categoria: nombreLimpio }));
    setNuevaCatInput('');
  }

  // MODIFICAR/RENOMBRAR CATEGORÍA EN LA BASE DE DATOS
  async function renombrarCategoria(e) {
    e.preventDefault();
    const viejoNombre = catAEditar;
    const nuevoNombre = nuevoNombreCat.trim();

    if (!viejoNombre || !nuevoNombre || viejoNombre === nuevoNombre) return;

    try {
      const { error } = await supabase
        .from('productos')
        .update({ categoria: nuevoNombre })
        .eq('categoria', viejoNombre);

      if (error) throw error;

      alert(`Categoría "${viejoNombre}" actualizada a "${nuevoNombre}" en la base de datos.`);
      setCatAEditar('');
      setNuevoNombreCat('');
      cargarProductos();
    } catch (err) {
      alert('Error al modificar la categoría: ' + err.message);
    }
  }

  // ELIMINAR CATEGORÍA DE LA BASE DE DATOS
  async function eliminarCategoria(catEliminar, borrarProductosAsociados = false) {
    const cantidadEnUso = productos.filter((p) => p.categoria === catEliminar).length;

    if (borrarProductosAsociados) {
      const confirmar = window.confirm(
        `⚠️ ADVERTENCIA: Se eliminarán la categoría "${catEliminar}" Y TODOS los ${cantidadEnUso} productos asociados. ¿Deseas continuar?`
      );
      if (!confirmar) return;

      try {
        const { error } = await supabase
          .from('productos')
          .delete()
          .eq('categoria', catEliminar);

        if (error) throw error;

        alert(`Se eliminaron todos los productos de la categoría "${catEliminar}".`);
      } catch (err) {
        alert('Error al eliminar los productos: ' + err.message);
        return;
      }
    } else {
      if (cantidadEnUso > 0) {
        const confirmar = window.confirm(
          `Hay ${cantidadEnUso} producto(s) asignados a "${catEliminar}". ¿Deseas desasignar la categoría (dejándola en blanco en esos productos)?`
        );
        if (!confirmar) return;

        try {
          const { error } = await supabase
            .from('productos')
            .update({ categoria: '' })
            .eq('categoria', catEliminar);

          if (error) throw error;
        } catch (err) {
          alert('Error al desasignar la categoría: ' + err.message);
          return;
        }
      } else {
        if (!window.confirm(`¿Seguro que querés eliminar la categoría "${catEliminar}"?`)) return;
      }
    }

    const listaFiltrada = categorias.filter((c) => c !== catEliminar);
    setCategorias(listaFiltrada);

    if (nuevo.categoria === catEliminar) {
      setNuevo((prev) => ({ ...prev, categoria: listaFiltrada[0] || '' }));
    }

    cargarProductos();
  }

  async function guardarEdicion(e) {
    e.preventDefault();
    if (!editando) return;

    try {
      let imagen_url = editando.imagen_url;

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
          imagen_url,
        })
        .eq('id', editando.id)
        .select()
        .single();

      if (error) throw error;

      const productosActualizados = productos.map((p) => (p.id === editando.id ? data : p));
      setProductos(productosActualizados);
      extraerCategorias(productosActualizados);

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
    if (!nuevo.nombre || !nuevo.precio || !nuevo.stock || !nuevo.categoria) {
      setErrorMsg('Completá todos los campos obligatorios.');
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

      const { error } = await supabase.from('productos').insert({
        nombre: nuevo.nombre,
        categoria: nuevo.categoria,
        precio: Number(nuevo.precio),
        stock: Number(nuevo.stock),
        imagen_url,
      });

      if (error) throw error;

      setNuevo({ nombre: '', categoria: categorias[0] || '', precio: '', stock: '' });
      setArchivo(null);
      cargarProductos();
    } catch (err) {
      setErrorMsg('No se pudo agregar el producto: ' + err.message);
    } finally {
      setSubiendo(false);
    }
  }

  const productosFiltrados = productos.filter((p) => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === 'TODAS' || p.categoria === categoriaFiltro;
    return coincideNombre && coincideCategoria;
  });

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

      {/* PANEL DE GESTIÓN Y ELIMINACIÓN DE CATEGORÍAS */}
      <details style={{ marginBottom: '25px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <summary style={{ fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem' }}>⚙️ Administrar / Eliminar Categorías</summary>
        
        <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#555' }}>Categorías registradas:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categorias.map((cat) => {
                const count = productos.filter((p) => p.categoria === cat).length;
                return (
                  <div
                    key={cat}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#fff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                    }}
                  >
                    <span><strong>{cat}</strong> ({count} productos)</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => eliminarCategoria(cat, false)}
                        title="Desasignar categoría de los productos y borrarla de la lista"
                        style={{ padding: '4px 8px', background: '#f57c00', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Quitar Categoría
                      </button>

                      {count > 0 && (
                        <button
                          type="button"
                          onClick={() => eliminarCategoria(cat, true)}
                          title="Eliminar categoría junto con todos sus productos"
                          style={{ padding: '4px 8px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          🗑️ Eliminar Todo
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formulario para Renombrar Categoría */}
          <form onSubmit={renombrarCategoria} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #eee' }}>
            <span style={{ width: '100%', fontSize: '0.9rem', fontWeight: 'bold' }}>Renombrar categoría:</span>
            <select
              value={catAEditar}
              onChange={(e) => {
                setCatAEditar(e.target.value);
                setNuevoNombreCat(e.target.value);
              }}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', flex: '1', minWidth: '150px' }}
            >
              <option value="">Seleccionar categoría...</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Nuevo nombre..."
              value={nuevoNombreCat}
              onChange={(e) => setNuevoNombreCat(e.target.value)}
              disabled={!catAEditar}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', flex: '1', minWidth: '150px' }}
            />

            <button
              type="submit"
              disabled={!catAEditar || !nuevoNombreCat.trim()}
              style={{ padding: '8px 15px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              ✏️ Renombrar
            </button>
          </form>

        </div>
      </details>

      {/* FORMULARIO AGREGAR PRODUCTO */}
      <form className="contact-form agregar-producto-form" onSubmit={agregarProducto}>
        <h3>Agregar nuevo producto</h3>

        <input
          placeholder="Nombre del producto"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
        />

        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <select
            value={nuevo.categoria}
            onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="+ Crear nueva categoría..."
              value={nuevaCatInput}
              onChange={(e) => setNuevaCatInput(e.target.value)}
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }}
            />
            <button
              type="button"
              onClick={agregarNuevaCategoria}
              style={{ padding: '8px 12px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Agregar
            </button>
          </div>
        </div>

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

      {/* BUSCADOR Y FILTROS */}
      <div style={{ marginTop: '35px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Buscar producto por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: '2', minWidth: '220px', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        />

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          style={{ flex: '1', minWidth: '160px', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        >
          <option value="TODAS">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <h3 className="stock-lista-titulo" style={{ marginTop: '25px' }}>
        Productos ({productosFiltrados.length})
      </h3>

      {cargando ? (
        <p>Cargando...</p>
      ) : productosFiltrados.length === 0 ? (
        <p style={{ color: '#777', fontStyle: 'italic' }}>No se encontraron productos.</p>
      ) : (
        <div className="stock-lista">
          {productosFiltrados.map((p) => (
            <div key={p.id} className="stock-item">
              {editando?.id === p.id ? (
                /* MODO EDITAR */
                <form className="editar-producto" onSubmit={guardarEdicion}>
                  <h4>Editar producto</h4>

                  {p.imagen_url && (
                    <img
                      src={editando.archivo ? URL.createObjectURL(editando.archivo) : p.imagen_url}
                      alt={p.nombre}
                    />
                  )}

                  <input
                    type="text"
                    placeholder="Nombre"
                    value={editando.nombre}
                    onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                  />

                  <input
                    type="number"
                    placeholder="Precio"
                    value={editando.precio}
                    onChange={(e) => setEditando({ ...editando, precio: e.target.value })}
                  />

                  <select
                    value={editando.categoria}
                    onChange={(e) => setEditando({ ...editando, categoria: e.target.value })}
                  >
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Stock"
                    value={editando.stock}
                    onChange={(e) => setEditando({ ...editando, stock: e.target.value })}
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditando({ ...editando, archivo: e.target.files[0] })}
                  />

                  <button type="submit" className="submit-btn">
                    💾 Guardar cambios
                  </button>

                  <button type="button" className="cancelar-edicion-btn" onClick={() => setEditando(null)}>
                    Cancelar
                  </button>
                </form>
              ) : (
                /* MODO NORMAL */
                <>
                  {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} />}

                  <div className="stock-item-info">
                    <strong>{p.nombre}</strong>
                    <span>
                      {p.categoria || 'Sin categoría'} — ${Number(p.precio).toLocaleString('es-AR')}
                    </span>
                    <span>Stock: {p.stock}</span>
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
                        archivo: null,
                      })
                    }
                  >
                    ✏️ Editar
                  </button>

                  <button className="eliminar-producto-btn" onClick={() => eliminarProducto(p.id)}>
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