"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables first
dotenv_1.default.config();
const client_1 = require("@prisma/client");
const extension_optimize_1 = require("@prisma/extension-optimize");
const createPrismaClient = () => {
    // Check for required environment variables
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is required');
    }
    // Create base client
    const client = new client_1.PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
    // Add optimize extension if API key is available
    if (process.env.OPTIMIZE_API_KEY) {
        return client.$extends((0, extension_optimize_1.withOptimize)({
            apiKey: process.env.OPTIMIZE_API_KEY,
        }));
    }
    // Return base client if no optimize key
    return client;
};
// Initialize client
const prisma = global.prisma || createPrismaClient();
// Save reference in development
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
exports.default = prisma;
//# sourceMappingURL=prisma.js.map