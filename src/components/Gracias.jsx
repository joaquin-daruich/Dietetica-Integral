import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';

// Número de WhatsApp de la dietética, formato internacional sin '+' ni espacios.
const WHATSAPP_DIETETICA = '5492215929856';

export default function Gracias() {
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get('pedido');
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const { vaciar } = useCart();

  const irAWhatsapp = (p) => {
    const detalle = p.productos.map((prod) => `- ${prod.cantidad}x ${prod.nombre}`).join('%0A');
    const mensaje =
      `Hola! Acabo de hacer un pedido (N° ${p.id}) por un total de $${Number(p.total).toLocaleString('es-AR')}:%0A` +
      `${detalle}%0A%0AMi nombre es ${p.nombre} ${p.apellido}.`;
    window.location.href = `https://wa.me/${WHATSAPP_DIETETICA}?text=${mensaje}`;
  };

  useEffect(() => {
    async function cargarPedido() {
      if (!pedidoId) {
        setCargando(false);
        return;
      }
      const { data } = await supabase.from('pedidos').select('*').eq('id', pedidoId).single();
      setPedido(data);
      setCargando(false);
      vaciar();
      if (data) {
        // Redirige automáticamente a WhatsApp a los 2 segundos.
        setTimeout(() => irAWhatsapp(data), 2000);
      }
    }
    cargarPedido();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId]);

  if (cargando) return <div className="container gracias-page">Confirmando tu pedido...</div>;

  return (
    <div className="container gracias-page">
      <h2>¡Gracias por tu compra! 🎉</h2>
      {pedido ? (
        <>
          <p>Tu pedido N° {pedido.id} fue registrado correctamente.</p>
          <p className="gracias-redirigiendo">Te estamos redirigiendo a WhatsApp para avisarle a la dietética...</p>
          <button className="cta-button" onClick={() => irAWhatsapp(pedido)}>
            Avisar por WhatsApp 💬
          </button>
        </>
      ) : (
        <p>
          No pudimos encontrar el pedido, pero si ya pagaste tranquilo/a que quedó registrado.
          Podés escribirnos directamente por WhatsApp.
        </p>
      )}
    </div>
  );
}
