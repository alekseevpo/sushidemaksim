import { Router } from 'express';
import axios from 'axios';
import { config } from '../config.js';

const router = Router();

router.post('/', async (req, res) => {
    const { name, email, message, recaptchaToken } = req.body;

    if (!name || !email || !message || !recaptchaToken) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Verify ReCaptcha
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${config.recaptchaSecret}&response=${recaptchaToken}`;
        const response = await axios.post(verificationUrl);
        const { success, score } = response.data;

        if (!success || score < 0.5) {
            return res.status(403).json({ 
                error: 'Fallo en la verificación anti-spam. Por favor, inténtalo de nuevo.' 
            });
        }

        // Process message (e.g., save to DB or send email)
        // For now, we'll just log it and simulate success
        console.log(`📩 New message from ${name} (${email}): ${message}`);

        // You could use sendOrderReceiptEmail logic here to send the contact message
        // to the admin email.

        return res.json({ message: '¡Mensaje enviado con éxito!' });
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return res.status(500).json({ error: 'Error al procesar el mensaje. Por favor, intente más tarde.' });
    }
});

export default router;
