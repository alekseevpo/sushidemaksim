import nodemailer from 'nodemailer';
import { config } from '../config.js';

const transporter = nodemailer.createTransport({
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
    <div style="background:linear-gradient(135deg,#DC2626,#F87171);padding:40px;text-align:center;position:relative;">
      <div style="font-size:50px;margin-bottom:10px;">🎁</div>
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">¡Feliz Cumpleaños!</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:16px;font-style:italic;">Queremos celebrar tu día especial</p>
    </div>
    <div style="padding:40px;text-align:center;">
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

      <a href="https://sushidemaksim.vercel.app/menu" style="display:inline-block;background:#DC2626;color:#white;padding:16px 40px;border-radius:16px;text-decoration:none;font-weight:900;font-size:15px;box-shadow:0 8px 20px rgba(220,38,38,0.2);color:#ffffff;">CANJEAR MI REGALO</a>
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
export async function sendOrderReceiptEmail(to: string, orderData: any): Promise<void> {
  const from = `"${config.smtp.fromName}" <${config.smtp.user}>`;

  const itemsHtml = orderData.items
    .map(
      (item: any) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 0; color: #374151; font-size: 15px;">${item.quantity}x ${item.name}</td>
      <td style="padding: 12px 0; text-align: right; color: #374151; font-size: 15px; font-weight: bold;">
        ${(item.price_at_time * item.quantity).toFixed(2).replace('.', ',')} €
      </td>
    </tr>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif;">
  <div style="max-width:500px;margin:30px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
    <div style="padding:30px 20px;background:#dc2626;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;">🍣 Sushi de Maksim</h1>
    </div>
    <div style="padding:30px;">
      <h2 style="font-size:20px;color:#111827;margin:0 0 15px;">¡Hola ${orderData.customerName}!</h2>
      <p style="font-size:15px;line-height:1.5;color:#374151;margin:0 0 20px;">
        Gracias por tu pedido. Hemos recibido tu orden <strong>#${String(orderData.orderId).padStart(5, '0')}</strong> y la estamos preparando.
      </p>
      
      <div style="border-top:1px solid #e5e7eb;margin:20px 0;"></div>
      
      <h3 style="font-size:14px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 15px;">Resumen de tu pedido:</h3>
      
      <table style="width:100%;border-collapse:collapse;margin-bottom:10px;">
        ${itemsHtml}
      </table>
      
      <div style="border-top:1px solid #e5e7eb;margin:20px 0;"></div>
      
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="font-size:18px;font-weight:bold;color:#111827;">TOTAL</td>
          <td style="font-size:20px;font-weight:bold;color:#dc2626;text-align:right;">
            ${orderData.total.toFixed(2).replace('.', ',')} €
          </td>
        </tr>
      </table>
      
      <div style="border-top:1px solid #e5e7eb;margin:20px 0;"></div>
      
      <h3 style="font-size:14px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 15px;">Detalles de entrega:</h3>
      <p style="font-size:14px;color:#4b5563;margin:4px 0;"><strong>Dirección:</strong> ${orderData.deliveryAddress}</p>
      <p style="font-size:14px;color:#4b5563;margin:4px 0;"><strong>Teléfono:</strong> ${orderData.phoneNumber}</p>
      ${orderData.notes ? `<p style="font-size:14px;color:#4b5563;margin:4px 0;"><strong>Notas:</strong> ${orderData.notes}</p>` : ''}
      
      <p style="font-size:14px;color:#6b7280;text-align:center;margin-top:40px;font-style:italic;">
        Tiempo aproximado de entrega: 30-60 minutos.<br />
        ¡Esperamos que lo disfrutes!
      </p>
    </div>
    <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #f3f4f6;">
      <p style="font-size:12px;color:#9ca3af;margin:0;">© ${new Date().getFullYear()} Sushi de Maksim | Madrid</p>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from,
    to,
    subject: `Confirmación de Pedido #${String(orderData.orderId).padStart(5, '0')} — Sushi de Maksim`,
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
      <a href="https://sushidemaksim.vercel.app/menu" style="display:inline-block;background:#DC2626;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px;box-shadow:0 4px 12px rgba(220,38,38,0.2);">VER EL MENÚ</a>
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
export async function sendVerificationEmail(to: string, name: string, token: string, promoCode: string): Promise<void> {
  const from = `"${config.smtp.fromName}" <${config.smtp.user}>`;
  const activationUrl = `https://sushidemaksim.vercel.app/verify?token=${token}`;
  const logoUrl = 'https://sushidemaksim.vercel.app/logo.svg';

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
    <div style="background-color: #000000; padding: 40px 20px; text-align: center;">
      <div style="margin-bottom: 16px;">
        <span style="background-color: #dc2626; color: #ffffff; padding: 8px 12px; border-radius: 8px; font-weight: 900; font-size: 20px;">🍣</span>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">
        MAKSIM<span style="color:#dc2626;">.</span>
      </h1>
      <p style="color: #6b7280; margin: 5px 0 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Sushi de Autor</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px; text-align: center;">
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
    <div style="background-color: #f9fafb; padding: 32px 20px; text-align: center; border-top: 1px solid #f1f5f9;">
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
