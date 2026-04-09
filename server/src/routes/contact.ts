import { Router } from 'express';
import { sendContactFormEmail } from '../utils/email.js';

const router = Router();

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // reCAPTCHA verification removed as per user request

        // Process message: send email to admin
        await sendContactFormEmail(name, email, message);

        console.log(`📩 New message from ${name} (${email}) sent to admin.`);

        return res.json({ message: '¡Mensaje enviado con éxito!' });
    } catch (error) {
        console.error('Error processing contact message:', error);
        return res
            .status(500)
            .json({ error: 'Error al procesar el mensaje. Por favor, intente más tarde.' });
    }
});

export default router;
