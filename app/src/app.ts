import express, { Request, Response, NextFunction, Application } from 'express';
import bodyParser from 'body-parser';
import httpContext from 'express-http-context';
import { clerkMiddleware } from '@clerk/express';
import dotenv from 'dotenv';
import routes from '@api/routes';
import cors from 'cors';
import { logAPIRequest, logAPIResponse } from '@core/Logger';

// Load environment variables
dotenv.config();

const app: Application = express();

// Request timing middleware for performance monitoring
app.use((_req: Request, res: Response, next: NextFunction): void => {
    res.locals.startTime = Date.now();
    next();
});

// Apply Clerk middleware BEFORE other middleware and routes
app.use(clerkMiddleware());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(httpContext.middleware);
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['*'],
    })
);

app.use((req: Request, _res: Response, next: NextFunction): void => {
    httpContext.set('req', req);
    next();
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction): void => {
    // Log incoming request
    logAPIRequest(
        req.method,
        req.originalUrl,
        req.headers.authorization ? 'authenticated' : 'anonymous',
        req.body
    );

    // Capture original res.json to log response
    const originalJson = res.json;
    res.json = function (body: any) {
        const duration = Date.now() - res.locals.startTime;
        logAPIResponse(req.method, req.originalUrl, res.statusCode, duration);
        return originalJson.call(this, body);
    };

    next();
});

// Error handling middleware
app.use(function (err: any, _req: Request, res: Response, _next: NextFunction): void {
    res.json({
        status: false,
        statusMessage: res.statusCode + ' - ' + err.message,
        errorMessage: err.message,
    });
});

routes(app);

app.use(function (_req: Request, res: Response): void {
    res.status(404).json({
        status: false,
        statusMessage: '404 - Page not found',
    });
});

export default app;
