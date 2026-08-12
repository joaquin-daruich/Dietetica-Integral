import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { estaLogueado, cerrarSesion } from '../lib/auth';
import AdminLogin from './AdminLogin';

export default function Pedidos() {
  const [logueado, setLogueado] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function verificarSesion() {
      const activo = await estaLogueado();
      setLogueado(activo);
      setVerificando(false);
    }
    verificarSesion();
  }, []);

  useEffect(() => {
    if (!logueado) return;
    cargarPedidos();
  }, [logueado]);

  async function cargarPedidos() {
    setCargando(true);
    const { data } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: true });
    setPedidos(data || []);
    setCargando(false);
  }

  async function marcarEntregado(id) {
    await supabase.from('pedidos').update({ entregado: true }).eq('id', id);
    cargarPedidos();
  }

  if (verificando) return null;
  if (!logueado) return <AdminLogin onLogin={() => setLogueado(true)} />;

  const pendientes = pedidos.filter((p) => !p.entregado);
  const entregados = pedidos.filter((p) => p.entregado);

  return (
    <div className="pedidos-page container">
      <div className="admin-header">
        <h2>Pedidos</h2>
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

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <div className="pedidos-columnas">
          <div className="pedidos-columna">
            <h3>Pendientes de entrega ({pendientes.length})</h3>
            {pendientes.map((p) => (
              <PedidoCard key={p.id} pedido={p} onEntregar={() => marcarEntregado(p.id)} />
            ))}
            {pendientes.length === 0 && <p className="sin-pedidos">No hay pedidos pendientes</p>}
          </div>
          <div className="pedidos-columna">
            <h3>Entregados ({entregados.length})</h3>
            {entregados.map((p) => (
              <PedidoCard key={p.id} pedido={p} entregado />
            ))}
            {entregados.length === 0 && (
              <p className="sin-pedidos">Todavía no hay pedidos entregados</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PedidoCard({ pedido, onEntregar, entregado }) {
  const fecha = new Date(pedido.created_at).toLocaleString('es-AR');
  const soloNumeros = pedido.telefono.replace(/\D/g, '');
  const linkWhatsapp = `https://wa.me/549${soloNumeros}`;

  return (
    <div className={`pedido-card ${pedido.estado === 'pendiente' ? 'pedido-sin-pagar' : ''}`}>
      <div className="pedido-card-header">
        <span>Pedido #{pedido.id}</span>
        <span className={`pedido-estado estado-${pedido.estado}`}>
          {pedido.estado === 'pagado' ? 'Pagado ✅' : 'Pago pendiente ⚠️'}
        </span>
      </div>
      <p className="pedido-fecha">{fecha}</p>
      <p>
        <strong>
          {pedido.nombre} {pedido.apellido}
        </strong>{' '}
        — DNI {pedido.dni}
      </p>
      <ul className="pedido-productos-lista">
        {pedido.productos.map((prod, idx) => (
          <li key={idx}>
            {prod.cantidad}x {prod.nombre}
          </li>
        ))}
      </ul>
      <p className="pedido-total">
        <strong>Total: ${Number(pedido.total).toLocaleString('es-AR')}</strong>
      </p>
      <div className="pedido-acciones">
        <a href={linkWhatsapp} target="_blank" rel="noopener noreferrer" className="whatsapp-cliente-btn">
          Hablar por WhatsApp
        </a>
        {!entregado && (
          <button className="marcar-entregado-btn" onClick={onEntregar}>
            Marcar como entregado
          </button>
        )}
      </div>
    </div>
  );
}
