import { Resend } from 'resend';
import { env } from '../config/env';
import { Order } from '../models/order.model';

const resend = env.resend.apiKey ? new Resend(env.resend.apiKey) : null;

/** Escapes user-supplied text (address, phone, email) before it goes into HTML. */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function money(amount: number, currency: string): string {
  return `${currency === 'ARS' ? '$' : currency + ' '}${amount.toLocaleString('es-AR')}`;
}

function itemRows(order: Order): string {
  return order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px">
            ${esc(item.brand)} ${esc(item.model)} — T.${esc(item.size)} ${esc(item.color)}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;text-align:right">
            ×${item.quantity} &nbsp; ${money(item.unitPrice * item.quantity, order.currency)}
          </td>
        </tr>`,
    )
    .join('');
}

function confirmationHtml(order: Order): string {
  const shortId = order.id.slice(0, 8).toUpperCase();
  return `<!DOCTYPE html>
<html lang="es">
<body style="font-family:Georgia,serif;color:#111;max-width:580px;margin:0 auto;padding:32px 24px">
  <p style="font-size:22px;font-weight:600;letter-spacing:0.08em;margin:0 0 4px">GENARO</p>
  <p style="font-size:12px;color:#888;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 36px">Zapatería artesanal</p>

  <h1 style="font-size:20px;font-weight:400;margin:0 0 12px">¡Gracias por tu compra!</h1>
  <p style="font-size:14px;color:#333;line-height:1.6;margin:0 0 8px">
    Tu compra fue realizada con éxito y ya estamos preparando tu pedido.
    Te vamos a avisar cuando lo despachemos.
  </p>
  <p style="font-size:14px;color:#555;margin:0 0 28px">Número de orden: <strong style="color:#111">#${shortId}</strong></p>

  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eee;margin-bottom:16px">
    ${itemRows(order)}
  </table>

  <p style="text-align:right;font-size:17px;font-weight:600;margin:0 0 32px">
    Total: ${money(order.subtotal, order.currency)}
  </p>

  ${order.shippingAddress ? `<p style="font-size:13px;color:#555;margin:0 0 6px">📦 <strong>Dirección de envío:</strong> ${esc(order.shippingAddress)}</p>` : ''}
  ${order.shippingPhone ? `<p style="font-size:13px;color:#555;margin:0 0 6px">📞 <strong>Teléfono:</strong> ${esc(order.shippingPhone)}</p>` : ''}

  <p style="font-size:13px;color:#555;line-height:1.6;margin:28px 0 0">
    ¿Tenés alguna consulta sobre tu pedido? Respondé este mail y te contestamos.
  </p>

  <hr style="border:none;border-top:1px solid #eee;margin:36px 0 20px">
  <p style="font-size:12px;color:#aaa;margin:0">
    Genaro · Zapatería artesanal &nbsp;·&nbsp; ${new Date().getFullYear()}
  </p>
</body>
</html>`;
}

function adminNotificationHtml(order: Order): string {
  const shortId = order.id.slice(0, 8).toUpperCase();
  return `<!DOCTYPE html>
<html lang="es">
<body style="font-family:sans-serif;color:#111;max-width:560px;margin:0 auto;padding:24px">
  <h2 style="font-size:18px;margin:0 0 16px">Nueva venta — pedido #${shortId}</h2>

  <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-bottom:20px">
    <tr><td style="color:#888;padding:3px 0;width:130px">Cliente</td><td><strong>${esc(order.payerEmail ?? '—')}</strong></td></tr>
    <tr><td style="color:#888;padding:3px 0">Total</td><td><strong>${money(order.subtotal, order.currency)}</strong></td></tr>
    <tr><td style="color:#888;padding:3px 0">Proveedor</td><td>${order.provider === 'mercadopago' ? 'Mercado Pago' : 'PayPal'}</td></tr>
    ${order.shippingAddress ? `<tr><td style="color:#888;padding:3px 0">Envío</td><td>${esc(order.shippingAddress)}</td></tr>` : ''}
    ${order.shippingPhone ? `<tr><td style="color:#888;padding:3px 0">Teléfono</td><td>${esc(order.shippingPhone)}</td></tr>` : ''}
    <tr><td style="color:#888;padding:3px 0">ID de orden</td><td style="font-family:monospace;font-size:12px">${esc(order.id)}</td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eee">
    ${itemRows(order)}
  </table>
</body>
</html>`;
}

/** Plain-text alternative: spam filters trust HTML-only mail less. */
function orderText(order: Order, intro: string): string {
  const lines = order.items.map(
    (i) =>
      `- ${i.brand} ${i.model} · talle ${i.size} · ${i.color} · x${i.quantity} · ${money(i.unitPrice * i.quantity, order.currency)}`,
  );
  return [
    intro,
    '',
    `Pedido #${order.id.slice(0, 8).toUpperCase()}`,
    ...lines,
    `Total: ${money(order.subtotal, order.currency)}`,
    order.shippingAddress ? `Envío: ${order.shippingAddress}` : '',
    order.shippingPhone ? `Teléfono: ${order.shippingPhone}` : '',
  ]
    .filter((l) => l !== '')
    .join('\n');
}

export const emailService = {
  async sendOrderConfirmation(order: Order): Promise<void> {
    if (!resend || !order.payerEmail) return;
    const shortId = order.id.slice(0, 8).toUpperCase();
    await resend.emails
      .send({
        from: env.resend.fromEmail,
        to: order.payerEmail,
        subject: `¡Gracias por tu compra en Genaro! Pedido #${shortId}`,
        html: confirmationHtml(order),
        text: orderText(
          order,
          '¡Gracias por tu compra! Tu compra fue realizada con éxito y ya estamos preparando tu pedido. Te vamos a avisar cuando lo despachemos.',
        ),
        // Customer replies land in the store's inbox.
        ...(env.resend.adminEmail ? { replyTo: env.resend.adminEmail } : {}),
      })
      .then(({ error }) => {
        if (error) console.error('[email] sendOrderConfirmation rejected:', error);
      })
      .catch((err) => {
        console.error('[email] sendOrderConfirmation failed:', err);
      });
  },

  async sendAdminNotification(order: Order): Promise<void> {
    if (!resend || !env.resend.adminEmail) return;
    const shortId = order.id.slice(0, 8).toUpperCase();
    await resend.emails
      .send({
        from: env.resend.fromEmail,
        to: env.resend.adminEmail,
        subject: `Nueva venta en Genaro - pedido #${shortId}`,
        html: adminNotificationHtml(order),
        text: orderText(order, `Nueva venta. Cliente: ${order.payerEmail ?? '-'}`),
      })
      .then(({ error }) => {
        if (error) console.error('[email] sendAdminNotification rejected:', error);
      })
      .catch((err) => {
        console.error('[email] sendAdminNotification failed:', err);
      });
  },
};
