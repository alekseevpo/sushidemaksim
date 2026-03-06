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
