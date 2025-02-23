import { PrismaClient } from '@prisma/client';
import { withOptimize } from '@prisma/extension-optimize';

const extendedPrisma = () => new PrismaClient().$extends(withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY }));
type PrismaClientExtended = ReturnType<typeof extendedPrisma>;

declare global {
    // eslint-disable-next-line no-unused-vars
    var prisma: PrismaClientExtended | undefined;
}

const prisma = global.prisma || extendedPrisma();

if (process.env.NODE_ENV !== 'production') { global.prisma = prisma; }
export default prisma;