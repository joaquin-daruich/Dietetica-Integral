import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Verificación en consola para depuración en Netlify Logs
if (!process.env.MP_ACCESS_TOKEN?.startsWith('APP_USR-')) {
  console.warn('⚠️ ATENCIÓN: MP_ACCESS_TOKEN no parece ser de producción (debe empezar con APP_USR-)');
}

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

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

    const siteUrl = process.env.URL || 'https://dietetica-integral.netlify.app/';

    // 2. Construcción del body para Mercado Pago Producción
    const preferenceBody = {
      items: items.map((i) => ({
        id: String(i.id),
        title: String(i.nombre),
        quantity: Number(i.cantidad),
        unit_price: Number(i.precio),
        currency_id: 'ARS',
      })),
      payer: {
        name: comprador.nombre,
        surname: comprador.apellido,
        phone: {
          number: comprador.telefono
        },
        identification: {
          type: 'DNI',
          number: String(comprador.dni)
        }
      },
      back_urls: {
        success: `${siteUrl}/gracias?pedido=${pedido.id}`,
        failure: `${siteUrl}/checkout?error=pago_fallido`,
        pending: `${siteUrl}/gracias?pedido=${pedido.id}`,
      },
      external_reference: String(pedido.id),
      auto_return: 'approved',
    };

    if (siteUrl.startsWith('https://') && !siteUrl.includes('localhost')) {
      preferenceBody.notification_url = `${siteUrl}/.netlify/functions/webhook-mercadopago`;
    }

    // 3. Crear preferencia
    const preference = new Preference(mpClient);
    const resultado = await preference.create({ body: preferenceBody });

    // FORZAMOS init_point (Producción Real)
    if (!resultado.init_point) {
      throw new Error('Mercado Pago no devolvió un punto de inicio de pago en producción.');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ init_point: resultado.init_point, pedidoId: pedido.id }),
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