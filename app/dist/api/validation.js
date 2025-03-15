"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = validateParams;
exports.validateBody = validateBody;
const zod_1 = require("zod");
/**
 * Middleware for validating request parameters using Zod schemas
 */
function validateParams(schema) {
    return (req, res, next) => {
        try {
            const validatedParams = schema.parse(req.params);
            req.params = validatedParams;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
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
function validateBody(schema) {
    return (req, res, next) => {
        try {
            const validatedBody = schema.parse(req.body);
            req.body = validatedBody;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
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
//# sourceMappingURL=validation.js.map