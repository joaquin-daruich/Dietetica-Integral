// Netlify Function: recibe la notificación (webhook) de Mercado Pago cuando
// un pago cambia de estado, y actualiza el pedido en Supabase a "pagado".
// Esto es lo que garantiza que el pedido quede bien marcado aunque el
// cliente cierre el navegador antes de volver al sitio.

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const paymentId = body?.data?.id || event.queryStringParameters?.['data.id'];

    if (!paymentId) {
      return { statusCode: 200, body: 'ok' };
    }

    const payment = new Payment(mpClient);
    const info = await payment.get({ id: paymentId });

    if (info.status === 'approved' && info.external_reference) {
      await supabase
        .from('pedidos')
        .update({ estado: 'pagado' })
        .eq('id', info.external_reference);
    }

    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    console.error('Error en webhook de Mercado Pago:', err);
    // Siempre devolvemos 200 para que Mercado Pago no reintente en loop.
    return { statusCode: 200, body: 'ok' };
  }
};
