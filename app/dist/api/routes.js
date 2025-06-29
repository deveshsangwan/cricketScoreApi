"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupRoutes;
const express_1 = __importDefault(require("express"));
const express_2 = require("@clerk/express");
// Import controller and validation modules with proper types
const controller_1 = __importDefault(require("./controller"));
const validation_1 = require("./validation");
// Import generated schemas
const matchStats_zod_1 = require("@schema/matchStats.zod");
const Logger_1 = require("@/core/Logger");
const router = express_1.default.Router();
// Error handler function with proper types
const errorHandler = (fn) => async (req, res, _next) => {
    try {
        await fn(req, res);
    }
    catch (err) {
        console.error('An error occurred:', err);
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
    return (req, res, next) => {
        const auth = (0, express_2.getAuth)(req);
        (0, Logger_1.writeLogInfo)([
            `API Request: ${req.method} ${req.originalUrl} - User ID: ${auth?.userId || 'Not Authenticated'}`,
        ]);
        if (!auth || !auth.userId) {
            return res.status(401).json({
                status: false,
                statusMessage: '401 - Unauthorized',
                errorMessage: 'Authentication Failed',
            });
        }
        next();
    };
};
// Export a function that sets up routes
function setupRoutes(app) {
    app.use('/', router);
    // Apply custom apiRequireAuth middleware to protected routes
    router.get('/liveMatches', apiRequireAuth(), errorHandler(controller_1.default.live));
    router.get('/matchStats/:matchId', apiRequireAuth(), (0, validation_1.validateParams)(matchStats_zod_1.matchStatsParamsSchema), errorHandler(controller_1.default.matchStats));
    router.get('/matchStats', apiRequireAuth(), errorHandler(controller_1.default.getMatchStats));
}
//# sourceMappingURL=routes.js.map