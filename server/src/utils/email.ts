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
