"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_http_context_1 = __importDefault(require("express-http-context"));
const express_2 = require("@clerk/express");
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("@api/routes"));
const cors_1 = __importDefault(require("cors"));
const Logger_1 = require("@core/Logger");
const configuration_1 = __importDefault(require("@core/configuration"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Request timing middleware for performance monitoring
app.use((_req, res, next) => {
    console.log('CORS origin:', _req.headers.origin);
    res.locals.startTime = Date.now();
    next();
});
// Apply Clerk middleware BEFORE other middleware and routes
app.use((0, express_2.clerkMiddleware)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_http_context_1.default.middleware);
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        const allowedOrigins = configuration_1.default.get('cors:allowedOrigins');
        console.log('CORS origin:', origin);
        console.log('CORS allowedOrigins:', allowedOrigins);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: configuration_1.default.get('cors:methods'),
    allowedHeaders: configuration_1.default.get('cors:allowedHeaders'),
    credentials: configuration_1.default.get('cors:credentials'),
}));
app.use((req, _res, next) => {
    express_http_context_1.default.set('req', req);
    next();
});
// Request logging middleware
app.use((req, res, next) => {
    // Log incoming request
    (0, Logger_1.logAPIRequest)(req.method, req.originalUrl, req.headers.authorization ? 'authenticated' : 'anonymous', req.body);
    // Capture original res.json to log response
    const originalJson = res.json;
    res.json = function (body) {
        const duration = Date.now() - res.locals.startTime;
        (0, Logger_1.logAPIResponse)(req.method, req.originalUrl, res.statusCode, duration);
        return originalJson.call(this, body);
    };
    next();
});
// Error handling middleware
app.use(function (err, _req, res, _next) {
    // Set appropriate status code based on error type
    if (err.message === 'Not allowed by CORS') {
        res.status(403);
    }
    else if (!res.statusCode || res.statusCode === 200) {
        res.status(500);
    }
    res.json({
        status: false,
        statusMessage: res.statusCode + ' - ' + err.message,
        errorMessage: err.message,
    });
});
(0, routes_1.default)(app);
app.use(function (_req, res) {
    res.status(404).json({
        status: false,
        statusMessage: '404 - Page not found',
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map