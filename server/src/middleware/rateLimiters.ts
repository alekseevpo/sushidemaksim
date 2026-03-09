import { rateLimit } from 'express-rate-limit';
import { config } from '../config.js';

const skip = () => config.isDev;

/**
 * General limiter for all /api requests
 */
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: skip() ? 1000 : 120, // 120 requests per minute
    message: { error: 'Demasiadas solicitudes. Inténtalo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip,
});

/**
 * Limiter for authentication endpoints (login, register)
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: skip() ? 100 : 20, // 20 attempts
    message: { error: 'Demasiados intentos. Inténtalo de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip,
});

/**
 * Strict limiter for sensitive actions (password reset, email verification, critical profile changes)
 */
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: skip() ? 50 : 5, // 5 attempts per hour
    message: { error: 'Demasiados intentos críticos. Por seguridad, espera una hora.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip,
});

/**
 * Limiter for creating orders to prevent spam
 */
export const orderLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: skip() ? 50 : 5, // 5 orders per 30 minutes
    message: { error: 'Demasiados pedidos en poco tiempo. Inténtalo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip,
});

/**
 * Limiter for promo code validation to prevent brute-forcing
 */
export const promoLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: skip() ? 100 : 15, // 15 checks
    message: { error: 'Demasiados intentos de código promo. Inténtalo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip,
});
