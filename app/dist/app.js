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
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Apply Clerk middleware BEFORE other middleware and routes
app.use((0, express_2.clerkMiddleware)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_http_context_1.default.middleware);
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
}));
app.use((req, _res, next) => {
    express_http_context_1.default.set('req', req);
    next();
});
// Error handling middleware
app.use(function (err, _req, res, _next) {
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