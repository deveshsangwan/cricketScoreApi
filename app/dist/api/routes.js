"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupRoutes;
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Import controller and validation modules with proper types
const controller_1 = __importDefault(require("./controller"));
const validation_1 = require("./validation");
// Import generated schemas
const token_zod_1 = require("@schema/token.zod");
const matchStats_zod_1 = require("@schema/matchStats.zod");
const router = express_1.default.Router();
// Define rate limiter
const generateTokenLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests created from this IP, please try again after 15 minutes',
});
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
// Export a function that sets up routes
function setupRoutes(app) {
    app.use('/', router);
    router.post('/generateToken', generateTokenLimiter, (0, validation_1.validateBody)(token_zod_1.tokenRequestSchema), errorHandler(controller_1.default.generateToken));
    router.get('/liveMatches', errorHandler(controller_1.default.live));
    router.get('/matchStats/:matchId', (0, validation_1.validateParams)(matchStats_zod_1.matchStatsParamsSchema), errorHandler(controller_1.default.matchStats));
    router.get('/matchStats', errorHandler(controller_1.default.getMatchStats));
}
//# sourceMappingURL=routes.js.map