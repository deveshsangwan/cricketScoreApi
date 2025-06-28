import express, { Request, Response, NextFunction, Application } from 'express';
import bodyParser from 'body-parser';
import httpContext from 'express-http-context';
import { expressjwt, UnauthorizedError } from 'express-jwt';
import dotenv from 'dotenv';
import routes from '@api/routes';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app: Application = express();

const SECRET_KEY: string = process.env.SECRET_KEY || '';

// Middleware for checking JWT
const checkJwt = expressjwt({
    secret: SECRET_KEY,
    algorithms: ['HS256'],
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(httpContext.middleware);

app.use((req: Request, _res: Response, next: NextFunction): void => {
    httpContext.set('req', req);
    next();
});

// Define your protected routes
const protectedRoutes: string[] = ['/liveMatches', '/matchStats/:matchId', '/matchStats'];

// Apply the checkJwt middleware to the protected routes
protectedRoutes.forEach((route: string): void => {
    app.all(route, checkJwt);
});

// Error handling middleware
app.use(function (err: any, _req: Request, res: Response, next: NextFunction): void {
    console.log("=======req========", _req.body, _req.headers);
    console.log("========error===========", err);
    if (err instanceof UnauthorizedError && err.message === 'jwt expired') {
        res.status(401).json({
            status: false,
            statusMessage: 'Token expired',
        });
        return;
    }
    next(err);
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['*'],
}));

routes(app);

app.use(function (_req: Request, res: Response): void {
    res.status(404).json({
        status: false,
        statusMessage: '404 - Page not found',
    });
});

export default app;
