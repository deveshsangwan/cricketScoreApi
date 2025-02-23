import { PrismaClient } from '@prisma/client';
// import { withOptimize } from '@prisma/extension-optimize';

// const extendedPrisma = () => new PrismaClient().$extends(withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY }));
// type PrismaClientExtended = ReturnType<typeof extendedPrisma>;

declare global {
    // eslint-disable-next-line no-unused-vars
    // var prisma: PrismaClientExtended | undefined;
    var prisma: PrismaClient | undefined;
}

// const prisma = global.prisma || extendedPrisma();
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') { global.prisma = prisma; }
export default prisma;