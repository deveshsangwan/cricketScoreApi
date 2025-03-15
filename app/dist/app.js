"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_http_context_1 = __importDefault(require("express-http-context"));
const express_jwt_1 = require("express-jwt");
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("@api/routes"));
// import cors from 'cors';
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const SECRET_KEY = process.env.SECRET_KEY || '';
// Middleware for checking JWT
const checkJwt = (0, express_jwt_1.expressjwt)({
    secret: SECRET_KEY,
    algorithms: ['HS256'],
});
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_http_context_1.default.middleware);
app.use((req, _res, next) => {
    express_http_context_1.default.set('req', req);
    next();
});
// Define your protected routes
const protectedRoutes = ['/liveMatches', '/matchStats/:matchId', '/matchStats'];
// Apply the checkJwt middleware to the protected routes
protectedRoutes.forEach((route) => {
    app.all(route, checkJwt);
});
// Error handling middleware
app.use(function (err, _req, res, next) {
    console.log(err);
    if (err instanceof express_jwt_1.UnauthorizedError && err.message === 'jwt expired') {
        res.status(401).json({
            status: false,
            statusMessage: 'Token expired',
        });
        return;
    }
    next(err);
});
/* app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})); */
(0, routes_1.default)(app);
app.use(function (_req, res) {
    res.status(404).json({
        status: false,
        statusMessage: '404 - Page not found',
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map