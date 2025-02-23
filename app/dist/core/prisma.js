"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const extension_optimize_1 = require("@prisma/extension-optimize");
const extendedPrisma = () => new client_1.PrismaClient().$extends((0, extension_optimize_1.withOptimize)({ apiKey: process.env.OPTIMIZE_API_KEY }));
const prisma = global.prisma || extendedPrisma();
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
exports.default = prisma;
//# sourceMappingURL=prisma.js.map