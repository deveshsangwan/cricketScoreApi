import { PrismaClient } from '@prisma/client';
import { writeLogInfo, writeLogError } from './Logger';

const prisma = new PrismaClient();

const findAll = async (modelName: string) => {
    try {
        const response = await prisma[modelName].findMany();
        return response;
    } catch (err) {
        writeLogError([`findAll ${modelName} error: `, err]);
        throw err;
    }
};

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
            }
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

export {
    findAll,
    findById,
    findIdByMatchUrl,
    insert,
    insertMany
};