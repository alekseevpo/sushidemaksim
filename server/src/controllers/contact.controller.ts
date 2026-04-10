import { Request, Response } from 'express';
import { ContactInput } from '../schemas/contact.schema.js';
import { processContactMessage } from '../services/contact.service.js';

/**
 * Controller for handling contact form submission.
 */
export async function contactHandler(
    req: Request<{}, {}, ContactInput>, 
    res: Response
) {
    try {
        await processContactMessage(req.body);
        
        console.log(`📩 New message from ${req.body.name} (${req.body.email}) processed via Controller.`);
        
        return res.json({ message: '¡Mensaje enviado con éxito!' });
    } catch (error) {
        console.error('Error in contactHandler:', error);
        return res.status(500).json({ 
            error: 'Error al procesar el mensaje. Por favor, intente más tarde.' 
        });
    }
}
