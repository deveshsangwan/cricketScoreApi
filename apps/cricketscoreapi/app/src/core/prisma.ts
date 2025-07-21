import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { withOptimize } from '@prisma/extension-optimize';

const createPrismaClient = () => {
    // Check for required environment variables
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is required');
    }

    // Create base client
    const client = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

    // Add optimize extension if API key is available
    if (process.env.OPTIMIZE_API_KEY) {
        return client.$extends(
            withOptimize({
                apiKey: process.env.OPTIMIZE_API_KEY,
            })
        );
    }

    // Return base client if no optimize key
    return client;
};

declare global {
    var prisma: ReturnType<typeof createPrismaClient> | undefined;
}

// Initialize client
const prisma = global.prisma || createPrismaClient();

// Save reference in development
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
