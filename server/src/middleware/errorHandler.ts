import { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    const message = err.message || 'Unknown error';

    // Log with stack in development
    if (config.isDev) {
        console.error('❌ Error:', err.stack || message);
    } else {
        console.error('❌ Error:', message);
    }

    // Handle specific SQLite errors
    if (message.includes('UNIQUE constraint')) {
        return res.status(409).json({ error: 'El recurso ya existe' });
    }

    if (message.includes('FOREIGN KEY constraint')) {
        return res.status(400).json({ error: 'Referencia a recurso inexistente' });
    }

    if (message.includes('NOT NULL constraint')) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Handle malformed JSON body
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON inválido en el cuerpo de la petición' });
    }

    // Handle JWT errors gracefully
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // HTTP errors with status
    if (err.status && err.status < 500) {
        return res.status(err.status).json({ error: message });
    }

    // Generic server error (don't leak details in production)
    res.status(500).json({
        error: 'Error interno del servidor',
        ...(config.isDev && { details: message }),
    });
}

