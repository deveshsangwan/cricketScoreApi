import { assert } from 'chai';
import sinon from 'sinon';

describe('Prisma Client', () => {
    let originalEnv: NodeJS.ProcessEnv;
    let prismaStub: sinon.SinonStub;
    let optimizeStub: sinon.SinonStub;

    beforeEach(() => {
        // Backup original env
        originalEnv = { ...process.env };
        // Clear module cache to test initialization
        delete require.cache[require.resolve('../../app/dist/core/prisma')];
        // Clear global prisma instance
        delete global.prisma;

        // Setup stubs
        prismaStub = sinon.stub().returns({
            $extends: sinon.stub().returns({ extended: true })
        });
        optimizeStub = sinon.stub().returns({});

        // Create module stubs
        const prismaModule = {
            PrismaClient: prismaStub
        };
        const optimizeModule = {
            withOptimize: optimizeStub
        };

        // Use module.exports to properly mock the modules
        require.cache[require.resolve('@prisma/client')] = {
            exports: prismaModule
        } as NodeModule;

        require.cache[require.resolve('@prisma/extension-optimize')] = {
            exports: optimizeModule
        } as NodeModule;
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
        // Clear module cache
        delete require.cache[require.resolve('@prisma/client')];
        delete require.cache[require.resolve('@prisma/extension-optimize')];
        delete require.cache[require.resolve('../../app/dist/core/prisma')];
    });

    it('should throw error when DATABASE_URL is missing', () => {
        delete process.env.DATABASE_URL;
        assert.throws(
            () => require('../../app/dist/core/prisma'),
            'DATABASE_URL environment variable is required'
        );
    });

    it('should create basic client when only DATABASE_URL is present', () => {
        process.env.DATABASE_URL = 'test-database-url';
        delete process.env.OPTIMIZE_API_KEY;

        require('../../app/dist/core/prisma');

        assert.isTrue(prismaStub.calledOnce);
        assert.deepEqual(prismaStub.firstCall.args[0], {
            datasources: {
                db: {
                    url: 'test-database-url'
                }
            }
        });
    });

    it('should create optimized client when OPTIMIZE_API_KEY is present', () => {
        process.env.DATABASE_URL = 'test-database-url';
        process.env.OPTIMIZE_API_KEY = 'test-optimize-key';

        require('../../app/dist/core/prisma');

        assert.isTrue(optimizeStub.calledOnce);
        assert.deepEqual(optimizeStub.firstCall.args[0], {
            apiKey: 'test-optimize-key'
        });
    });

    it('should save prisma reference to global in development', () => {
        process.env.DATABASE_URL = 'test-database-url';
        process.env.NODE_ENV = 'development';

        require('../../app/dist/core/prisma');

        assert.isDefined(global.prisma);
    });

    it('should not save prisma reference to global in production', () => {
        process.env.DATABASE_URL = 'test-database-url';
        process.env.NODE_ENV = 'production';

        require('../../app/dist/core/prisma');

        assert.isUndefined(global.prisma);
    });
});