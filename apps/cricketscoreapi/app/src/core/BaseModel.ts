/**
 * Database operations module using Prisma client
 * Provides CRUD operations for match data
 */

import prisma from './prisma';
import { writeLogError } from './Logger';
import type { livematches, matchstats } from '@prisma/client';

// Type-safe model names
export type ModelName = 'livematches' | 'matchstats';

// Type mapping for models to their corresponding Prisma types
type ModelTypeMap = {
    livematches: livematches;
    matchstats: matchstats;
};

// Helper to execute operations on models in a type-safe way
const executeOnModel = <T>(modelName: ModelName, operation: (model: any) => T): T => {
    switch (modelName) {
        case 'livematches':
            return operation(prisma.livematches);
        case 'matchstats':
            return operation(prisma.matchstats);
        default:
            throw new Error(`Unknown model: ${modelName}`);
    }
};

/**
 * Optimized version of findAll with field selection and optional limiting
 * @param modelName - Name of the Prisma model to query
 * @param options - Query options (select fields, limit, etc.)
 * @returns Promise resolving to array of records
 * @throws Error if database operation fails
 */
const findAll = async <T extends ModelName>(
    modelName: T,
    options?: {
        select?: Record<string, boolean>;
        limit?: number;
        orderBy?: Record<string, 'asc' | 'desc'>;
    }
): Promise<any[]> => {
    try {
        const queryOptions: any = {};
        
        if (options?.select) {
            queryOptions.select = options.select;
        }
        
        if (options?.limit) {
            queryOptions.take = options.limit;
        }
        
        if (options?.orderBy) {
            queryOptions.orderBy = options.orderBy;
        }
        
        const response = await executeOnModel(modelName, (model) => model.findMany(queryOptions));
        return response;
    } catch (err) {
        writeLogError([`findAll ${modelName} error: `, err]);
        throw err;
    }
};

/**
 * Finds a record by ID in specified model
 * @param matchId - ID of the record to find
 * @param modelName - Name of the Prisma model to query
 * @returns Promise resolving to matching record or null
 * @throws Error if database operation fails
 */
const findById = async <T extends ModelName>(
    matchId: string,
    modelName: T
): Promise<ModelTypeMap[T] | null> => {
    try {
        const response = await executeOnModel(modelName, (model) =>
            model.findUnique({ where: { id: matchId } })
        );
        return response;
    } catch (err) {
        writeLogError([`findById ${modelName} error: `, err]);
        throw err;
    }
};

const findIdByMatchUrl = async (matchUrl: string): Promise<livematches | null> => {
    try {
        return await prisma.livematches.findUnique({ where: { matchUrl: matchUrl } });
    } catch (err) {
        writeLogError(['findIdByMatchUrl error: ', err]);
        throw err;
    }
};

const insert = async <T extends ModelName>(
    data: object,
    modelName: T
): Promise<ModelTypeMap[T]> => {
    try {
        const { id, ...restData } = data as any;
        const response = await executeOnModel(modelName, (model) =>
            model.upsert({
                where: { id: id },
                update: restData,
                create: {
                    id,
                    ...restData,
                    createdAt: new Date(),
                },
            })
        );
        return response;
    } catch (err) {
        writeLogError([`insert ${modelName} error: `, err]);
        throw err;
    }
};

const insertMany = async (
    matches: object[],
    modelName: ModelName
): Promise<{ count: number } | undefined> => {
    try {
        if (!matches.length) {
            return;
        }

        const response = await executeOnModel(modelName, (model) =>
            model.createMany({ data: matches })
        );
        return response;
    } catch (err) {
        writeLogError([`insertMany ${modelName} error: `, err]);
        throw err;
    }
};

export { findAll, findById, findIdByMatchUrl, insert, insertMany };
