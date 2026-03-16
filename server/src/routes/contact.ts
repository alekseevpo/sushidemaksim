import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // reCAPTCHA verification removed as per user request

        // Process message (e.g., save to DB or send email)
        // For now, we'll just log it and simulate success
        console.log(`📩 New message from ${name} (${email}): ${message}`);

        return res.json({ message: '¡Mensaje enviado con éxito!' });
    } catch (error) {
        console.error('Error processing contact message:', error);
        return res
            .status(500)
            .json({ error: 'Error al procesar el mensaje. Por favor, intente más tarde.' });
    }
});

export default router;
