import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware for validating request parameters using Zod schemas
 */
export function validateParams<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedParams = schema.parse(req.params);
            req.params = validatedParams as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    status: false,
                    message: 'Invalid request parameters',
                    errors: error.errors,
                });
            }
            next(error);
        }
    };
}

/**
 * Middleware for validating request body using Zod schemas
 */
export function validateBody<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedBody = schema.parse(req.body);
            req.body = validatedBody as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    status: false,
                    message: 'Invalid request body',
                    errors: error.errors,
                });
            }
            next(error);
        }
    };
}
