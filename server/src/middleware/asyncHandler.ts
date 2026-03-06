import { Request, Response, NextFunction } from 'express';

type AsyncHandler = (req: any, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps an async route handler to automatically catch errors and pass them to next().
 * This allows using async/await without try/catch in every route.
 */
export function asyncHandler(fn: AsyncHandler) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
