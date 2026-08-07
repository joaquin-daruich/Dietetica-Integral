// Netlify Function: crea el pedido en Supabase (estado "pendiente_pago") y
// genera la preferencia de Checkout Pro de Mercado Pago.
// Mismo patrón ES modules que usaste en la integración de Jardín Secreto Libros.

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { items, comprador } = JSON.parse(event.body);

    if (!items || items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'El carrito está vacío' }) };
    }
    if (!comprador?.nombre || !comprador?.apellido || !comprador?.dni || !comprador?.telefono) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Faltan datos del comprador' }) };
    }

    const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

    // 1. Registrar el pedido en Supabase antes de mandarlo a Mercado Pago.
    const { data: pedido, error: errorPedido } = await supabase
      .from('pedidos')
      .insert({
        productos: items,
        total,
        nombre: comprador.nombre,
        apellido: comprador.apellido,
        dni: comprador.dni,
        telefono: comprador.telefono,
        estado: 'pendiente_pago',
        entregado: false,
      })
      .select()
      .single();

    if (errorPedido) throw errorPedido;

    const siteUrl = process.env.URL || 'https://ejemplo-cambiar.netlify.app';

    // 2. Crear la preferencia de Checkout Pro.
    const preference = new Preference(mpClient);
    const resultado = await preference.create({
      body: {
        items: items.map((i) => ({
          title: i.nombre,
          quantity: i.cantidad,
          unit_price: Number(i.precio),
          currency_id: 'ARS',
        })),
        payer: {
          name: comprador.nombre,
          surname: comprador.apellido,
        },
        back_urls: {
          success: `${siteUrl}/gracias?pedido=${pedido.id}`,
          failure: `${siteUrl}/checkout?error=pago_fallido`,
          pending: `${siteUrl}/gracias?pedido=${pedido.id}`,
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/.netlify/functions/webhook-mercadopago`,
        external_reference: String(pedido.id),
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ init_point: resultado.init_point, pedidoId: pedido.id }),
    };
  } catch (err) {
    console.error('Error creando preferencia:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
