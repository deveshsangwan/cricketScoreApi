/**
 * Database operations module using Prisma client
 * Provides CRUD operations for match data
 */

import prisma from './prisma';
import { writeLogError } from './Logger';

/**
 * Retrieves all records from specified model
 * @param modelName - Name of the Prisma model to query
 * @returns Promise resolving to array of records
 * @throws Error if database operation fails
 */
const findAll = async (modelName: string) => {
    try {
        const response = await prisma[modelName].findMany();
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
const findById = async (matchId: string, modelName: string) => {
    try {
        const response = await prisma[modelName].findUnique({ where: { id: matchId } });
        return response;
    } catch (err) {
        writeLogError([`findById ${modelName} error: `, err]);
        throw err;
    }
};

const findIdByMatchUrl = async (matchUrl: string) => {
    try {
        return await prisma.livematches.findUnique({ where: { matchUrl: matchUrl } });
    } catch (err) {
        writeLogError(['findIdByMatchUrl error: ', err]);
        throw err;
    }
};

const insert = async (data: object, modelName: string) => {
    try {
        const { id, ...restData } = data as any;
        const response = await prisma[modelName].upsert({
            where: { id: id },
            update: restData,
            create: {
                id,
                ...restData,
                createdAt: new Date(),
            },
        });
        return response;
    } catch (err) {
        writeLogError([`insert ${modelName} error: `, err]);
        throw err;
    }
};

const insertMany = async (matches: object[], modelName: string) => {
    try {
        if (!matches.length) {
            return;
        }

        const response = await prisma[modelName].createMany({ data: matches });
        return response;
    } catch (err) {
        writeLogError([`insertMany ${modelName} error: `, err]);
        throw err;
    }
};

export { findAll, findById, findIdByMatchUrl, insert, insertMany };
