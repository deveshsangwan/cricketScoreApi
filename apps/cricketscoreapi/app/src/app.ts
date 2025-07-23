import express, { Request, Response, NextFunction, Application } from 'express';
import bodyParser from 'body-parser';
import httpContext from 'express-http-context';
import { clerkMiddleware } from '@clerk/express';
import dotenv from 'dotenv';
import routes from '@api/routes';
import cors from 'cors';
import { logAPIRequest, logAPIResponse } from '@core/Logger';
import config from '@core/configuration';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter, createContext } from './trpc';

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
        origin: function (origin, callback) {
            const allowedOrigins: string[] = config.get('cors:allowedOrigins');
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: config.get('cors:methods') as string[],
        allowedHeaders: config.get('cors:allowedHeaders') as string[],
        credentials: config.get('cors:credentials') as boolean,
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
    // Set appropriate status code based on error type
    if (err.message === 'Not allowed by CORS') {
        res.status(403);
    } else if (!res.statusCode || res.statusCode === 200) {
        res.status(500);
    }
    
    res.json({
        status: false,
        statusMessage: res.statusCode + ' - ' + err.message,
        errorMessage: err.message,
    });
});

// tRPC middleware setup
app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
    })
);

routes(app);

app.use(function (_req: Request, res: Response): void {
    res.status(404).json({
        status: false,
        statusMessage: '404 - Page not found',
    });
});

export default app;
