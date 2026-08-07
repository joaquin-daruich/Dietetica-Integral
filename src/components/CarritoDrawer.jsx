import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CarritoDrawer({ abierto, onClose }) {
  const { items, quitar, cambiarCantidad, total, cantidadTotal } = useCart();
  const navigate = useNavigate();

  if (!abierto) return null;

  return (
    <div className="carrito-overlay" onClick={onClose}>
      <div className="carrito-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="carrito-header">
          <h3>Tu Carrito ({cantidadTotal})</h3>
          <button className="cerrar-carrito" onClick={onClose}>
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <p className="carrito-vacio">Tu carrito está vacío</p>
        ) : (
          <>
            <div className="carrito-items">
              {items.map((item) => (
                <div key={item.id} className="carrito-item">
                  <img src={item.imagen_url} alt={item.nombre} />
                  <div className="carrito-item-info">
                    <p>{item.nombre}</p>
                    <span>${Number(item.precio).toLocaleString('es-AR')}</span>
                    <div className="cantidad-control">
                      <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}>-</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}>+</button>
                    </div>
                  </div>
                  <button className="quitar-item" onClick={() => quitar(item.id)}>
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            <div className="carrito-footer">
              <p className="carrito-total">Total: ${total.toLocaleString('es-AR')}</p>
              <button
                className="cta-button carrito-checkout-btn"
                onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}
              >
                Finalizar compra
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
