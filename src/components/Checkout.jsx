import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { items, total } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', telefono: '' });
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.dni || !form.telefono) {
      setErrorMsg('Completá todos los datos para continuar.');
      return;
    }
    setEnviando(true);
    setErrorMsg('');
    try {
      const resp = await fetch('/.netlify/functions/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            nombre: i.nombre,
            precio: i.precio,
            cantidad: i.cantidad,
          })),
          comprador: form,
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error(data.error || 'No se pudo iniciar el pago');
      }
    } catch (err) {
      setErrorMsg('Hubo un error al iniciar el pago. Probá de nuevo en un momento.');
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
        <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} />
        <input name="dni" placeholder="DNI" value={form.dni} onChange={handleChange} />
        <input
          name="telefono"
          placeholder="Teléfono (con código de área, sin 0 ni 15)"
          value={form.telefono}
          onChange={handleChange}
        />
        {errorMsg && <p className="checkout-error">{errorMsg}</p>}
        <button type="submit" className="submit-btn" disabled={enviando}>
          {enviando ? 'Redirigiendo a Mercado Pago...' : 'Pagar con Mercado Pago'}
        </button>
      </form>
    </div>
  );
}
