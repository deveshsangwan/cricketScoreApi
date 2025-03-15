import express, { Request, Response, NextFunction, Router, Application } from 'express';
import rateLimit from 'express-rate-limit';

// Import controller and validation modules with proper types
import controller from './controller';
import { validateBody, validateParams } from './validation';

// Import generated schemas
import { tokenRequestSchema } from '@schema/token.zod';
import { matchStatsParamsSchema } from '@schema/matchStats.zod';

const router: Router = express.Router();

// Define rate limiter
const generateTokenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests created from this IP, please try again after 15 minutes',
});

// Error handler function with proper types
const errorHandler =
    (fn: (req: Request, res: Response) => Promise<any>) =>
    async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
        try {
            await fn(req, res);
        } catch (err: any) {
            console.error('An error occurred:', err);
            res.status(err.statusCode || 500);
            return res.json({
                status: false,
                statusMessage: res.statusCode + ' - ' + err.message,
                errorMessage: err.message,
            });
        }
    };

// Export a function that sets up routes
export default function setupRoutes(app: Application): void {
    app.use('/', router);

    router.post(
        '/generateToken',
        generateTokenLimiter,
        validateBody(tokenRequestSchema),
        errorHandler(controller.generateToken)
    );

    router.get('/liveMatches', errorHandler(controller.live));

    router.get(
        '/matchStats/:matchId',
        validateParams(matchStatsParamsSchema),
        errorHandler(controller.matchStats)
    );

    router.get('/matchStats', errorHandler(controller.getMatchStats));
}
