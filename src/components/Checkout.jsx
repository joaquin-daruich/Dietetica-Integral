import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';

export default function Checkout() {
  const { items, total, vaciar } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', telefono: '' });
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [whatsappNegocio, setWhatsappNegocio] = useState('');

  // Trae el número de WhatsApp del negocio desde configuracion
  useEffect(() => {
    async function cargarConfiguracion() {
      const { data, error } = await supabase
        .from('configuracion')
        .select('clave, valor')
        .eq('clave', 'whatsapp')
        .maybeSingle();

      if (!error && data) {
        setWhatsappNegocio(data.valor.replace(/\D/g, ''));
      }
    }
    cargarConfiguracion();
  }, []);

  if (items.length === 0) {
    return (
      <div className="checkout-page container">
        <p>Tu carrito está vacío.</p>
        <button className="cta-button" onClick={() => navigate('/productos')}>
          Ver productos
        </button>
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const armarMensajeWhatsapp = () => {
    const lineas = items.map(
      (i) => `${i.cantidad}x ${i.nombre} - $${(i.precio * i.cantidad).toLocaleString('es-AR')}`
    );
    return (
      `¡Hola! Quiero confirmar mi pedido:\n\n` +
      lineas.join('\n') +
      `\n\nTotal: $${total.toLocaleString('es-AR')}` +
      `\n\nDatos:\nNombre: ${form.nombre}\nTeléfono: ${form.telefono}`
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.telefono) {
      setErrorMsg('Completá todos los datos para continuar.');
      return;
    }
    if (!whatsappNegocio) {
      setErrorMsg('No se pudo cargar el WhatsApp del negocio. Probá de nuevo en un momento.');
      return;
    }

    setEnviando(true);
    setErrorMsg('');

    try {
      // Guarda el pedido directo en Supabase
      const { error } = await supabase.from('pedidos').insert({
        nombre: form.nombre,
        telefono: form.telefono,
        productos: items.map((i) => ({
          id: i.id,
          nombre: i.nombre,
          precio: i.precio,
          cantidad: i.cantidad,
        })),
        total,
        estado: 'pendiente',
        entregado: false,
      });

      if (error) throw error;

      const mensaje = encodeURIComponent(armarMensajeWhatsapp());
      vaciar();
      window.location.href = `https://wa.me/549${whatsappNegocio}?text=${mensaje}`;
    } catch (err) {
      setErrorMsg('Hubo un error al registrar tu pedido. Probá de nuevo en un momento.');
      setEnviando(false);
    }
  };

  return (
    <div className="checkout-page container">
      <h2>Finalizar Compra</h2>

      <div className="checkout-resumen">
        {items.map((i) => (
          <div key={i.id} className="checkout-item-resumen">
            <span>
              {i.cantidad}x {i.nombre}
            </span>
            <span>${(i.precio * i.cantidad).toLocaleString('es-AR')}</span>
          </div>
        ))}
        <div className="checkout-total-resumen">
          <strong>Total: ${total.toLocaleString('es-AR')}</strong>
        </div>
      </div>

      <form className="contact-form checkout-form" onSubmit={handleSubmit}>
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
        <input
          name="telefono"
          placeholder="Teléfono (con código de área, sin 0 ni 15)"
          value={form.telefono}
          onChange={handleChange}
        />
        {errorMsg && <p className="checkout-error">{errorMsg}</p>}
        <button type="submit" className="submit-btn" disabled={enviando}>
          {enviando ? 'Redirigiendo a WhatsApp...' : 'Confirmar pedido por WhatsApp'}
        </button>
      </form>
    </div>
  );
}