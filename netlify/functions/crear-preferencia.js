import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Responder a peticiones OPTIONS (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method not allowed' };
  }

  try {
    const { items, comprador } = JSON.parse(event.body || '{}');

    if (!items || items.length === 0) {
      return { 
        statusCode: 400, 
        headers,
        body: JSON.stringify({ error: 'El carrito está vacío' }) 
      };
    }
    if (!comprador?.nombre || !comprador?.apellido || !comprador?.dni || !comprador?.telefono) {
      return { 
        statusCode: 400, 
        headers,
        body: JSON.stringify({ error: 'Faltan datos del comprador' }) 
      };
    }

    const total = items.reduce((acc, i) => acc + Number(i.precio) * Number(i.cantidad), 0);

    // 1. Registrar el pedido en Supabase
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

    if (errorPedido) {
      console.error('Error guardando en Supabase:', errorPedido);
      throw new Error(`Error en base de datos: ${errorPedido.message}`);
    }

    const siteUrl = process.env.URL || 'https://ejemplo-cambiar.netlify.app';

    // Construcción del body para Mercado Pago
const preferenceBody = {
  items: items.map((i) => ({
    title: String(i.nombre),
    quantity: Number(i.cantidad),
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
  external_reference: String(pedido.id),
};

// Mercado Pago EXIGE https:// para activar auto_return
if (siteUrl.startsWith('https://')) {
  preferenceBody.auto_return = 'approved';
  
  if (!siteUrl.includes('localhost')) {
    preferenceBody.notification_url = `${siteUrl}/.netlify/functions/webhook-mercadopago`;
  }
}
    // 2. Crear preferencia
    const preference = new Preference(mpClient);
    const resultado = await preference.create({ body: preferenceBody });

    const initPoint = resultado.init_point || resultado.sandbox_init_point;

    if (!initPoint) {
      throw new Error('Mercado Pago no devolvió un link de pago válido.');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ init_point: initPoint, pedidoId: pedido.id }),
    };
  } catch (err) {
    console.error('Error en crear-preferencia:', err);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: err.message || 'Error interno del servidor' }) 
    };
  }
};