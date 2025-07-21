import express, { Request, Response, NextFunction, Router, Application } from 'express';
import { getAuth } from '@clerk/express';

// Import controller and validation modules with proper types
import controller from './controller';
import { validateParams } from './validation';

// Import generated schemas
import { matchStatsParamsSchema } from '@schema/matchStats.zod';
import { writeLogInfo } from '@/core/Logger';

const router: Router = express.Router();

// Error handler function with proper types
const errorHandler =
    (fn: (req: Request, res: Response) => Promise<any>) =>
    async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
        try {
            await fn(req, res);
        } catch (err: any) {
            res.status(err.statusCode || 500);
            return res.json({
                status: false,
                statusMessage: res.statusCode + ' - ' + err.message,
                errorMessage: err.message,
            });
        }
    };

// Custom requireAuth middleware for API endpoints that returns JSON
const apiRequireAuth = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const auth = getAuth(req);
        writeLogInfo([
            `API Request: ${req.method} ${req.originalUrl} - User ID: ${auth?.userId || 'Not Authenticated'}`,
        ]);

        if (!auth || !auth.userId) {
            writeLogInfo([
                `Authentication failed for: ${req.method} ${req.originalUrl} - IP: ${req.ip}`,
            ]);
            return res.status(401).json({
                status: false,
                statusMessage: '401 - Unauthorized',
                errorMessage: 'Authentication Failed',
            });
        }

        writeLogInfo([
            `Authentication successful for: ${req.method} ${req.originalUrl} - User: ${auth.userId}`,
        ]);
        next();
    };
};

// Export a function that sets up routes
export default function setupRoutes(app: Application): void {
    app.use('/', router);

    // Apply custom apiRequireAuth middleware to protected routes
    router.get('/liveMatches', apiRequireAuth(), errorHandler(controller.live));

    router.get(
        '/matchStats/:matchId',
        apiRequireAuth(),
        validateParams(matchStatsParamsSchema),
        errorHandler(controller.matchStats)
    );

    router.get('/matchStats', apiRequireAuth(), errorHandler(controller.getMatchStats));
}
