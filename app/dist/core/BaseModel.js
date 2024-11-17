"use strict";
/**
 * Database operations module using Prisma client
 * Provides CRUD operations for match data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMany = exports.insert = exports.findIdByMatchUrl = exports.findById = exports.findAll = void 0;
const client_1 = require("@prisma/client");
const Logger_1 = require("./Logger");
const prisma = new client_1.PrismaClient();
/**
 * Retrieves all records from specified model
 * @param modelName - Name of the Prisma model to query
 * @returns Promise resolving to array of records
 * @throws Error if database operation fails
 */
const findAll = async (modelName) => {
    try {
        const response = await prisma[modelName].findMany();
        return response;
    }
    catch (err) {
        (0, Logger_1.writeLogError)([`findAll ${modelName} error: `, err]);
        throw err;
    }
};
exports.findAll = findAll;
/**
 * Finds a record by ID in specified model
 * @param matchId - ID of the record to find
 * @param modelName - Name of the Prisma model to query
 * @returns Promise resolving to matching record or null
 * @throws Error if database operation fails
 */
const findById = async (matchId, modelName) => {
    try {
        const response = await prisma[modelName].findUnique({ where: { id: matchId } });
        return response;
    }
    catch (err) {
        (0, Logger_1.writeLogError)([`findById ${modelName} error: `, err]);
        throw err;
    }
};
exports.findById = findById;
const findIdByMatchUrl = async (matchUrl) => {
    try {
        return await prisma.livematches.findUnique({ where: { matchUrl: matchUrl } });
    }
    catch (err) {
        (0, Logger_1.writeLogError)(['findIdByMatchUrl error: ', err]);
        throw err;
    }
};
exports.findIdByMatchUrl = findIdByMatchUrl;
const insert = async (data, modelName) => {
    try {
        const { id, ...restData } = data;
        const response = await prisma[modelName].upsert({
            where: { id: id },
            update: restData,
            create: {
                id,
                ...restData,
                createdAt: new Date(),
            }
        });
        return response;
    }
    catch (err) {
        (0, Logger_1.writeLogError)([`insert ${modelName} error: `, err]);
        throw err;
    }
};
exports.insert = insert;
const insertMany = async (matches, modelName) => {
    try {
        if (!matches.length) {
            return;
        }
        const response = await prisma[modelName].createMany({ data: matches });
        return response;
    }
    catch (err) {
        (0, Logger_1.writeLogError)([`insertMany ${modelName} error: `, err]);
        throw err;
    }
};
exports.insertMany = insertMany;
//# sourceMappingURL=BaseModel.js.map