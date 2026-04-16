import { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';
import fs from 'fs';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    const message = err.message || 'Unknown error';

    // Log with stack in development
    if (config.isDev) {
        console.error('❌ Server Error:', err.stack || message);
        try {
            const logMsg = `\n[${new Date().toISOString()}] ERROR: ${err.message || 'No message'}\nCODE: ${err.code || 'No code'}\nSTACK: ${err.stack || ''}\nJSON: ${JSON.stringify(err, null, 2)}\n`;
            fs.appendFileSync('/tmp/server_error.log', logMsg);
        } catch (e) {
            console.error('⚠️ Failed to write to error log file:', e);
        }
    } else {
        console.error('❌ Server Error:', message);
    }

    // Handle PostgreSQL specific errors (Supabase)
    if (err.code === '23505' || message.includes('UNIQUE constraint')) {
        return res.status(409).json({ error: 'El recurso ya existe' });
    }

    if (err.code === '23503' || message.includes('FOREIGN KEY constraint')) {
        return res.status(400).json({
            error: 'Operación denegada: Este recurso está en uso por otros elementos (ej. pedidos u otros registros).',
        });
    }

    if (err.code === '23502' || message.includes('NOT NULL constraint')) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (err.code === '42501' || message.includes('row-level security policy')) {
        return res.status(403).json({
            error: 'Permiso denegado en la base de datos (RLS)',
            details: config.isDev ? message : undefined,
        });
    }

    if (err.code === 'PGRST116') {
        return res.status(404).json({ error: 'Recurso no encontrado' });
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
