import nodemailer from 'nodemailer';
import { config } from '../config.js';

export const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: false, // STARTTLS on port 587
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
    },
});

/**
 * Send a password-reset email with a 6-digit code.
 */
export async function sendResetCodeEmail(to: string, code: string): Promise<void> {
    const from = `"${config.smtp.fromName}" <${config.smtp.user}>`;

    await transporter.sendMail({
        from,
        to,
        subject: 'Código de recuperación — Sushi de Maksim',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#DC2626,#F87171);padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">🍣 Sushi de Maksim</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hola,</p>
      <p style="color:#374151;font-size:16px;margin:0 0 24px;">
        Has solicitado restablecer tu contraseña. Usa el siguiente código:
      </p>
      <div style="background:#FEF2F2;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#DC2626;">${code}</span>
      </div>
      <p style="color:#6B7280;font-size:14px;margin:0 0 8px;">
        Este código es válido durante <strong>15 minutos</strong>.
      </p>
      <p style="color:#6B7280;font-size:14px;margin:0;">
        Si no has solicitado este cambio, ignora este email.
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px;text-align:center;">
      <p style="color:#9CA3AF;font-size:12px;margin:0;">© ${new Date().getFullYear()} Sushi de Maksim</p>
    </div>
  </div>
</body>
</html>`,
    });
}

/**
 * Send a birthday gift email with a 10% discount code.
 */
export async function sendBirthdayGiftEmail(to: string, name: string, code: string): Promise<void> {
    const from = `"${config.smtp.fromName}" <${config.smtp.user}>`;

    await transporter.sendMail({
        from,
        to,
        subject: '¡Feliz Cumpleaños! Tu regalo te espera en Sushi de Maksim 🍣',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:500px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#DC2626,#F87171);padding:24px;text-align:center;position:relative;">
      <div style="font-size:50px;margin-bottom:10px;">🎁</div>
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">¡Feliz Cumpleaños!</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:16px;font-style:italic;">Queremos celebrar tu día especial</p>
    </div>
    <div style="padding:24px;text-align:center;">
      <p style="color:#374151;font-size:18px;margin:0 0 16px;font-weight:bold;">¡Hola ${name}!</p>
      <p style="color:#6B7280;font-size:16px;line-height:1.6;margin:0 0 32px;">
        En este día tan especial, para nosotros es un honor celebrarlo contigo. Te enviamos un regalo exclusivo para que disfrutes de lo que más te gusta:
      </p>
      
      <div style="background:#FFF7ED;border:2px dashed #FDBA74;border-radius:20px;padding:32px;margin-bottom:32px;position:relative;">
        <p style="color:#C2410C;font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Tu Código Descuento</p>
        <div style="font-size:36px;font-weight:900;color:#DC2626;letter-spacing:5px;">${code}</div>
        <p style="color:#C2410C;font-size:20px;font-weight:bold;margin:12px 0 0;">-10% EN TODO EL MENÚ</p>
      </div>

      <p style="color:#374151;font-size:15px;margin:0 0 32px;">
        *Válido para tu próximo pedido desde hoy. Solo tienes que introducir el código al finalizar tu compra.
      </p>

      <a href="${config.frontendUrl}/menu" style="display:inline-block;background:#DC2626;color:#white;padding:16px 40px;border-radius:16px;text-decoration:none;font-weight:900;font-size:15px;box-shadow:0 8px 20px rgba(220,38,38,0.2);color:#ffffff;">CANJEAR MI REGALO</a>
    </div>
    
    <div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="color:#9CA3AF;font-size:13px;margin:0 0 8px;">¡Que tengas un día maravilloso!</p>
      <p style="color:#9CA3AF;font-size:12px;margin:0;">© ${new Date().getFullYear()} Sushi de Maksim | Madrid</p>
      <p style="color:#E5E7EB;font-size:11px;margin:12px 0 0;">*Por seguridad, por favor muestra tu DNI al repartidor para validar la fecha.</p>
    </div>
  </div>
</body>
</html>`,
    });
}

/**
 * Send an order receipt email.
 */
export async function sendOrderReceiptEmail(
    to: string,
    orderData: any,
    isAdminCopy = false
): Promise<void> {
    const from = `"${config.smtp.fromName}" <${config.smtp.user}>`;

    const subject = isAdminCopy
        ? `🚨 [NUEVO PEDIDO] #${String(orderData.orderId).padStart(5, '0')} — Sushi de Maksim`
        : `Confirmación de Pedido #${String(orderData.orderId).padStart(5, '0')} — Sushi de Maksim`;

    const greeting = isAdminCopy ? '¡Hola Administrador!' : `¡Hola ${orderData.customerName}!`;

    // Parse notes for special instructions
    const notes = orderData.notes || '';
    let paymentMethod = 'No especificado';
    let noCall = false;
    let noBuzzer = false;
    let scheduledTime = '';
    let customerNote = '';

    const parts = notes.split(' | ');
    let deliveryType = 'DOMICILIO';
    parts.forEach((part: string) => {
        if (part.includes('[TIPO:')) {
            deliveryType = part.replace('[TIPO: ', '').replace(']', '').replace('[TIPO:', '');
        } else if (part.includes('[MÉTODO DE PAGO:') || part.includes('[PAGO:')) {
            paymentMethod = part
                .replace('[MÉTODO DE PAGO: ', '')
                .replace('[MÉTODO DE PAGO:', '')
                .replace('[PAGO: ', '')
                .replace('[PAGO:', '')
                .replace(']', '');
        } else if (part.includes('[ENTREGA PROGRAMADA:') || part.includes('[PROGRAMADO:')) {
            scheduledTime = part
                .replace('[ENTREGA PROGRAMADA: ', '')
                .replace('[ENTREGA PROGRAMADA:', '')
                .replace('[PROGRAMADO: ', '')
                .replace('[PROGRAMADO:', '')
                .replace(']', '');
        } else if (
            part.includes('[NO LLAMAR PARA CONFIRMACIÓN]') ||
            part.includes('[SIN CONFIRMACIÓN LLAMADA]')
        ) {
            noCall = true;
        } else if (
            part.includes('[NO LLAMAR AL TELEFONILLO - LLAMAR AL MÓVIL]') ||
            part.includes('[NO LLAMAR TIMBRE]')
        ) {
            noBuzzer = true;
        } else {
            customerNote += (customerNote ? ' | ' : '') + part;
        }
    });

    const itemsHtml = orderData.items
        .map(
            (item: any) => `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 12px 0;">
        <div style="font-weight: 600; color: #111827; font-size: 15px;">${item.name} ${item.quantity > 1 ? `<span style="color:#dc2626;">x${item.quantity}</span>` : ''}</div>
        <div style="color: #6b7280; font-size: 13px;">Precio unitario: ${item.price_at_time.toFixed(2).replace('.', ',')} €</div>
      </td>
      <td style="padding: 12px 0; text-align: right; vertical-align: top; font-weight: 700; color: #111827; font-size: 15px;">
        ${(item.price_at_time * item.quantity).toFixed(2).replace('.', ',')} €
      </td>
    </tr>
  `
        )
        .join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:10px auto;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background-color: #000000; padding: 16px 20px; text-align: center;">
      <div style="margin-bottom: 4px;">
        <span style="background-color: #dc2626; color: #ffffff; padding: 6px 10px; border-radius: 8px; font-weight: 900; font-size: 20px;">🍣</span>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">
        MAKSIM<span style="color:#dc2626;">.</span>
      </h1>
      <p style="color: #6b7280; margin: 2px 0 0; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">Confirmación de Pedido</p>
    </div>

    <div style="padding: 16px 20px;">
      <h2 style="color: #111827; margin: 0 0 4px; font-size: 20px; font-weight: 800;">${greeting}</h2>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin: 0 0 16px;">
        El pedido <strong>#${String(orderData.orderId).padStart(5, '0')}</strong> ha sido recibido con éxito.
      </p>

      <!-- Order Summary Card -->
      <div style="background-color: #f9fafb; border-radius: 16px; padding: 12px 16px; margin-bottom: 16px; border: 1px solid #f1f5f9;">
        <h3 style="color: #111827; margin: 0 0 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Resumen del Pedido</h3>
        
        <table style="width:100%; border-collapse:collapse;">
          ${itemsHtml}
        </table>

        <div style="margin-top: 8px; padding-top: 8px; border-top: 2px solid #e2e8f0;">
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding-top: 8px; color: #111827; font-size: 18px; font-weight: 900;">TOTAL</td>
              <td style="padding-top: 8px; text-align: right; color: #dc2626; font-size: 20px; font-weight: 900;">${orderData.total.toFixed(2).replace('.', ',')} €</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Payment & Delivery Type -->
      <div style="margin-bottom: 16px;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <h4 style="color: #9ca3af; margin: 0 0 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Método de Pago</h4>
              <div style="color: #111827; font-size: 15px; font-weight: 700;">
                ${paymentMethod.includes('TARJETA') ? '💳 Tarjeta' : '💵 Efectivo'}
              </div>
            </td>
            <td style="width: 50%; vertical-align: top;">
              <h4 style="color: #9ca3af; margin: 0 0 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Tipo de Entreга</h4>
              <div style="color: #111827; font-size: 15px; font-weight: 700;">
                ${deliveryType.includes('RECOGIDA') ? '🏬 Recogida en Local' : '🚚 Entrega a Domicilio'}
              </div>
            </td>
          </tr>
        </table>

        ${
            scheduledTime || noCall || noBuzzer || customerNote
                ? `
        <h4 style="color: #9ca3af; margin: 12px 0 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Instrucciones Especiales</h4>
        <div style="background-color: #fff1f2; border-radius: 12px; padding: 12px; border: 1px solid #fecdd3;">
          ${scheduledTime ? `<div style="color: #111827; font-size: 13px; font-weight: 700; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #fecdd3;">⏰ Entrega programada: <span style="color: #dc2626;">${scheduledTime}</span></div>` : ''}
          ${noCall ? '<div style="color: #be123c; font-size: 13px; font-weight: 700; margin-bottom: 4px;">🚫 No llamar para confirmar pedido</div>' : ''}
          ${noBuzzer ? '<div style="color: #be123c; font-size: 13px; font-weight: 700; margin-bottom: 4px;">🔕 No llamar al timbre (llamar al móvil)</div>' : ''}
          ${customerNote ? `<div style="color: #4b5563; font-size: 13px; line-height: 1.4; margin-top: ${noCall || noBuzzer ? '8px' : '0'}; border-top: ${noCall || noBuzzer ? '1px solid #fecdd3' : 'none'}; padding-top: ${noCall || noBuzzer ? '8px' : '0'};"><strong>Mensaje:</strong> ${customerNote}</div>` : ''}
        </div>
        `
                : ''
        }
      </div>

      <!-- Delivery Details -->
      <h4 style="color: #9ca3af; margin: 0 0 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">${deliveryType.includes('RECOGIDA') ? 'Punto de Recogida' : 'Detalles de Envío'}</h4>
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 12px; border: 1px solid #e2e8f0;">
        <div style="color: #4b5563; font-size: 13px; line-height: 1.5;">
          ${
              deliveryType.includes('RECOGIDA')
                  ? '<strong>📍 Dirección:</strong> Calle Barrilero, 20, 28007 Madrid'
                  : `<strong>📍 Dirección:</strong> ${orderData.deliveryAddress}`
          }
          <br>
          <strong>📱 Teléfono:</strong> ${orderData.phoneNumber}
        </div>
      </div>

      <!-- Store Info & Support -->
      <div style="margin-top: 12px; padding: 16px; background-color: #000000; border-radius: 16px; color: #ffffff;">
        <h4 style="color: #dc2626; margin: 0 0 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; text-align: center;">¿Necesitas algo? Contáctanos</h4>
        
        <table style="width:100%; border-collapse:collapse; margin-bottom: 16px;">
          <tr>
            <td style="width: 33%; padding: 0 4px;">
              <a href="https://wa.me/34641518390" style="display: block; background-color: #25D366; color: #ffffff; padding: 10px 0; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 12px; text-align: center;">WhatsApp</a>
            </td>
            <td style="width: 33%; padding: 0 4px;">
              <a href="mailto:info@sushidemaksim.com" style="display: block; background-color: #ffffff; color: #000000; padding: 10px 0; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 12px; text-align: center;">Email</a>
            </td>
            <td style="width: 33%; padding: 0 4px;">
              <a href="tel:+34641518390" style="display: block; background-color: #dc2626; color: #ffffff; padding: 10px 0; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 12px; text-align: center;">Llamar</a>
            </td>
          </tr>
        </table>

        <h4 style="color: #6b7280; margin: 16px 0 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Horario de Atención</h4>
        <table style="width: 100%; color: #9ca3af; font-size: 11px; border-collapse: collapse;">
          <tr><td style="padding: 2px 0;">Miércoles – Viernes:</td><td style="text-align: right; color: #ffffff;">20:00 – 23:00</td></tr>
          <tr><td style="padding: 2px 0;">Sábado:</td><td style="text-align: right; color: #ffffff;">14:00 – 17:00 | 20:00 – 23:00</td></tr>
          <tr><td style="padding: 2px 0;">Domingo:</td><td style="text-align: right; color: #ffffff;">14:00 – 17:00</td></tr>
          <tr><td style="padding: 2px 0;">Lunes – Martes:</td><td style="text-align: right;">Cerrado</td></tr>
        </table>
        
        <div style="margin-top: 12px; border-top: 1px solid #374151; padding-top: 12px; font-size: 10px; text-align: center; color: #6b7280;">
          <strong>Sushi de Maksim</strong><br>
          Calle Barrilero, 20, 28007 Madrid
        </div>
      </div>

      <div style="margin-top: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 14px; font-style: italic; margin: 0;">
          Gracias por confiar en nosotros.<br>
          ¡Esperamos que disfrutes de la experiencia Maksim!
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 24px 20px; text-align: center; border-top: 1px solid #f1f5f9;">
      <p style="color: #9ca3af; font-size: 13px; margin: 0 0 12px;">© ${new Date().getFullYear()} Sushi de Maksim | Madrid</p>
      <div style="color: #e5e7eb; font-size: 11px;">
        Este es un correo automático, por favor no respondas a este mensaje.
      </div>
    </div>

  </div>
</body>
</html>
  `;

    await transporter.sendMail({
        from,
        to,
        subject,
        html,
    });
}

/**
 * Send a welcome email to a new user.
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
    const from = `"${config.smtp.fromName}" <${config.smtp.user}>`;

    await transporter.sendMail({
        from,
        to,
        subject: '¡Bienvenido a Sushi de Maksim! 🍣',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#DC2626,#F87171);padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">🍣 Sushi de Maksim</h1>
    </div>
    <div style="padding:32px;text-align:center;">
      <h2 style="color:#111827;margin:0 0 16px;font-size:20px;">¡Hola ${name}!</h2>
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px;">
        Gracias por registrarte en **Sushi de Maksim**. Estamos encantados de tenerte con nosotros. 🤍
      </p>
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 32px;">
        Prepárate para disfrutar del mejor sushi artesanal directamente en tu mesa. ¡Explora nuestro menú y haz tu primer pedido hoy mismo!
      </p>
      <a href="${config.frontendUrl}/menu" style="display:inline-block;background:#DC2626;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px;box-shadow:0 4px 12px rgba(220,38,38,0.2);">VER EL MENÚ</a>
    </div>
    <div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="color:#9CA3AF;font-size:12px;margin:0;">© ${new Date().getFullYear()} Sushi de Maksim | Madrid</p>
    </div>
  </div>
</body>
</html>`,
    });
}

/**
 * Send an email activation link to a new user.
 */
export async function sendVerificationEmail(
    to: string,
    name: string,
    token: string,
    promoCode: string
): Promise<void> {
    const from = `"${config.smtp.fromName}" <${config.smtp.user}>`;
    const activationUrl = `${config.frontendUrl}/verify?token=${token}`;

    await transporter.sendMail({
        from,
        to,
        subject: '¡Activa tu cuenta y recibe un regalo! 🎁 — Sushi de Maksim',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:20px auto;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.05);">
    
    <!-- Header with Stylized Logo -->
    <div style="background-color: #000000; padding: 24px 20px; text-align: center;">
      <div style="margin-bottom: 16px;">
        <span style="background-color: #dc2626; color: #ffffff; padding: 8px 12px; border-radius: 8px; font-weight: 900; font-size: 20px;">🍣</span>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">
        MAKSIM<span style="color:#dc2626;">.</span>
      </h1>
      <p style="color: #6b7280; margin: 5px 0 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Sushi de Autor</p>
    </div>

    <!-- Content -->
    <div style="padding: 24px 20px; text-align: center;">
      <h2 style="color: #111827; margin: 0 0 16px; font-size: 28px; font-weight: 800; line-height: 1.2;">¡Hola ${name}!</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
        Estamos muy felices de tenerte con nosotros. Para empezar a disfrutar del mejor sushi artesanal, activa tu cuenta y desbloquea tu regalo de bienvenida.
      </p>

      <!-- Welcome Gift Section -->
      <div style="background: #fff1f2; border: 2px dashed #fecdd3; border-radius: 20px; padding: 24px; margin-bottom: 32px;">
        <p style="color: #be123c; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px;">TU REGALO (-5%)</p>
        <div style="color: #dc2626; font-size: 32px; font-weight: 900; margin-bottom: 8px;">${promoCode}</div>
        <p style="color: #9f1239; font-size: 14px; font-weight: bold; margin: 0;">
          ⚠️ Válido solo durante <strong>24 horas</strong>
        </p>
      </div>

      <!-- Activation Button -->
      <a href="${activationUrl}" style="display:inline-block;background:#dc2626;color:#ffffff;padding:18px 40px;border-radius:18px;text-decoration:none;font-weight:900;font-size:16px;box-shadow:0 8px 25px rgba(220,38,38,0.25);margin-bottom:32px;">
        ACTIVAR MI CUENTA
      </a>

      <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
        <a href="${activationUrl}" style="color: #dc2626; text-decoration: none;">${activationUrl}</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 24px 20px; text-align: center; border-top: 1px solid #f1f5f9;">
      <p style="color: #9ca3af; font-size: 13px; margin: 0 0 12px;">© ${new Date().getFullYear()} Sushi de Maksim | Madrid</p>
      <div style="color: #e5e7eb; font-size: 11px;">
        Recibiste este correo porque te registraste en sushidemaksim.com
      </div>
    </div>

  </div>
</body>
</html>`,
    });
}

/**
 * Send an email change verification link to a user.
 */
export async function sendEmailChangeVerificationEmail(
    to: string,
    name: string,
    token: string
): Promise<void> {
    const from = `"${config.smtp.fromName}" <${config.smtp.user}>`;
    const activationUrl = `${config.frontendUrl}/verify-email-change?token=${token}`;

    await transporter.sendMail({
        from,
        to,
        subject: 'Confirma tu nuevo correo electrónico — Sushi de Maksim',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:20px auto;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.05);">
    
    <div style="background-color: #000000; padding: 40px 20px; text-align: center;">
      <div style="margin-bottom: 16px;">
        <span style="background-color: #dc2626; color: #ffffff; padding: 8px 12px; border-radius: 8px; font-weight: 900; font-size: 20px;">🍣</span>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">
        MAKSIM<span style="color:#dc2626;">.</span>
      </h1>
      <p style="color: #6b7280; margin: 5px 0 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Confirmación de Email</p>
    </div>

    <div style="padding: 24px; text-align: center;">
      <h2 style="color: #111827; margin: 0 0 16px; font-size: 28px; font-weight: 800; line-height: 1.2;">¡Hola ${name}!</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
        Has solicitado cambiar tu correo electrónico en Sushi de Maksim. Para completar el proceso, por favor haz clic en el botón de abajo.
      </p>

      <a href="${activationUrl}" style="display:inline-block;background:#dc2626;color:#ffffff;padding:18px 40px;border-radius:18px;text-decoration:none;font-weight:900;font-size:16px;box-shadow:0 8px 25px rgba(220,38,38,0.25);margin-bottom:32px;">
        CONFIRMAR NUEVO EMAIL
      </a>

      <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
        Este enlace es válido durante 24 horas. Si no has solicitado este cambio, puedes ignorar este mensaje de forma segura.
      </p>
    </div>

    <div style="background-color: #f9fafb; padding: 24px 20px; text-align: center; border-top: 1px solid #f1f5f9;">
      <p style="color: #9ca3af; font-size: 13px; margin: 0 0 12px;">© ${new Date().getFullYear()} Sushi de Maksim | Madrid</p>
    </div>
  </div>
</body>
</html>`,
    });
}

/**
 * Send a welcome email to a new newsletter subscriber.
 */
export async function sendNewsletterWelcomeEmail(to: string, promoCode: string): Promise<void> {
    const from = `"${config.smtp.fromName}" <${config.smtp.user}>`;

    await transporter.sendMail({
        from,
        to,
        subject: '¡Bienvenido al Club! 🎉 Tu regalo de Sushi de Maksim te espera',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:500px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#000000,#333333);padding:24px;text-align:center;position:relative;">
      <div style="font-size:50px;margin-bottom:10px;">✨</div>
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">¡Ya eres del Club!</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:16px;font-style:italic;">Bienvenido a la familia Sushi de Maksim</p>
    </div>
    <div style="padding:24px;text-align:center;">
      <p style="color:#374151;font-size:18px;margin:0 0 16px;font-weight:bold;">¡Hola!</p>
      <p style="color:#6B7280;font-size:16px;line-height:1.6;margin:0 0 32px;">
        Gracias por suscribirte. Como prometimos, aquí tienes un regalo especial para que disfrutes de tu próximo pedido con nosotros:
      </p>
      
      <div style="background:#FFF1F2;border:2px dashed #FECDD3;border-radius:20px;padding:32px;margin-bottom:32px;position:relative;">
        <p style="color:#BE123C;font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Tu Código Promocional</p>
        <div style="font-size:36px;font-weight:900;color:#DC2626;letter-spacing:5px;">${promoCode}</div>
        <p style="color:#9F1239;font-size:20px;font-weight:bold;margin:12px 0 0;">-5% EN TU PRÓXIMO PEDIDO</p>
      </div>

      <p style="color:#374151;font-size:15px;margin:0 0 32px;">
        *Válido durante las próximas 24 horas. Solo tienes que introducir el código al finalizar tu compra en la web.
      </p>

      <a href="${config.frontendUrl}/menu" style="display:inline-block;background:#DC2626;color:#ffffff;padding:16px 40px;border-radius:16px;text-decoration:none;font-weight:900;font-size:15px;box-shadow:0 8px 20px rgba(220,38,38,0.2);color:#ffffff;">¡PEDIR AHORA!</a>
    </div>
    
    <div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="color:#9CA3AF;font-size:12px;margin:0;">© ${new Date().getFullYear()} Sushi de Maksim | Madrid</p>
      <p style="color:#E5E7EB;font-size:10px;margin:12px 0 0;">Recibiste este email porque te suscribiste a nuestra newsletter en sushidemaksim.com</p>
    </div>
  </div>
</body>
</html>`,
    });
}

/**
 * Send an abandoned cart reminder email.
 */
export async function sendAbandonedCartEmail(
    to: string,
    name: string,
    items: any[]
): Promise<void> {
    const from = `"${config.smtp.fromName}" <${config.smtp.user}>`;

    const itemsHtml = items
        .slice(0, 3)
        .map(
            (item: any) => `
        <div style="display: flex; align-items: center; margin-bottom: 12px; background: #f9fafb; padding: 10px; border-radius: 12px; border: 1px solid #f1f5f9;">
            <div style="font-weight: 800; font-size: 14px; color: #111827; flex: 1;">${item.menu_items?.name || 'Producto'}</div>
            <div style="color: #6b7280; font-size: 14px; font-weight: 700;">${item.quantity} x ${item.menu_items?.price?.toFixed(2) || '0.00'} €</div>
        </div>
    `
        )
        .join('');

    const moreItems =
        items.length > 3
            ? `<p style="color: #6b7280; font-size: 13px; margin: 4px 0;">...y ${items.length - 3} productos más</p>`
            : '';

    await transporter.sendMail({
        from,
        to,
        subject: '🍣 Te has olvidado algo delicioso...',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fdfbf7;font-family:Arial,sans-serif;">
  <div style="max-width:500px;margin:40px auto;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.06);border:1px solid #f1f5f9;">
    <div style="background:#000;padding:32px 24px;text-align:center;">
       <div style="background:#dc2626;display:inline-block;padding:8px 12px;border-radius:12px;margin-bottom:12px;">
         <span style="font-size:32px;">🍣</span>
       </div>
       <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">¿Se te antoja algo?</h1>
    </div>
    <div style="padding:32px 24px;text-align:center;">
      <p style="color:#111827;font-size:18px;margin:0 0 16px;font-weight:800;">¡Hola ${name}!</p>
      <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Hemos guardado los productos que dejaste en tu cesta. Siguen esperándote, pero no por mucho tiempo. El sushi sabe mejor cuando está fresco... ¡y ya mismo!
      </p>
      
      <div style="text-align: left; margin-bottom: 32px;">
        <h3 style="color: #9ca3af; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">En tu cesta:</h3>
        ${itemsHtml}
        ${moreItems}
      </div>

      <a href="${config.frontendUrl}/cart" style="display:inline-block;background:#dc2626;color:#ffffff;padding:18px 48px;border-radius:20px;text-decoration:none;font-weight:900;font-size:16px;box-shadow:0 10px 30px rgba(220,38,38,0.2);">VOLVER A MI CESTA</a>
      
      <p style="color:#9ca3af;font-size:13px;margin:24px 0 0;">
        Si tienes problemas con tu pedido, escríbenos por WhatsApp.
      </p>
    </div>
    
    <div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="color:#9CA3AF;font-size:12px;margin:0;">© ${new Date().getFullYear()} Sushi de Maksim | Madrid</p>
    </div>
  </div>
</body>
</html>`,
    });
}
