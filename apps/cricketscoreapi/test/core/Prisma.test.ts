import { assert } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

describe('Prisma Client', () => {
    let originalEnv: NodeJS.ProcessEnv;
    let prismaStub: sinon.SinonStub;
    let optimizeStub: sinon.SinonStub;

    beforeEach(() => {
        // Backup original env
        originalEnv = { ...process.env };
        // Clear global prisma instance
        delete global.prisma;

        // Setup stubs
        prismaStub = sinon.stub().returns({
            $extends: sinon.stub().returns({ extended: true }),
        });
        optimizeStub = sinon.stub().returns({});
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
        // Clear global prisma instance
        delete global.prisma;
        // Restore sinon stubs
        sinon.restore();
    });

    it('should throw error when DATABASE_URL is missing', () => {
        delete process.env.DATABASE_URL;
        
        // Use proxyquire to mock the dependencies
        assert.throws(
            () => {
                proxyquire('../../dist/app/src/core/prisma', {
                    '@prisma/client': {
                        PrismaClient: prismaStub,
                    },
                    '@prisma/extension-optimize': {
                        withOptimize: optimizeStub,
                    },
                    'dotenv': {
                        config: sinon.stub(), // Mock dotenv.config()
                    }
                });
            },
            Error,
            'DATABASE_URL environment variable is required'
        );
    });

    it('should create basic client when only DATABASE_URL is present', () => {
        process.env.DATABASE_URL = 'test-database-url';
        delete process.env.OPTIMIZE_API_KEY;

        proxyquire('../../dist/app/src/core/prisma', {
            '@prisma/client': {
                PrismaClient: prismaStub,
            },
            '@prisma/extension-optimize': {
                withOptimize: optimizeStub,
            },
            'dotenv': {
                config: sinon.stub(),
            }
        });

        assert.isTrue(prismaStub.calledOnce);
        assert.deepEqual(prismaStub.firstCall.args[0], {
            datasources: {
                db: {
                    url: 'test-database-url',
                },
            },
        });
    });

    it('should create optimized client when OPTIMIZE_API_KEY is present', () => {
        process.env.DATABASE_URL = 'test-database-url';
        process.env.OPTIMIZE_API_KEY = 'test-optimize-key';

        const mockExtendedClient = { extended: true };
        const mockBaseClient = {
            $extends: sinon.stub().returns(mockExtendedClient),
        };
        prismaStub.returns(mockBaseClient);

        proxyquire('../../dist/app/src/core/prisma', {
            '@prisma/client': {
                PrismaClient: prismaStub,
            },
            '@prisma/extension-optimize': {
                withOptimize: optimizeStub,
            },
            'dotenv': {
                config: sinon.stub(),
            }
        });

        assert.isTrue(optimizeStub.calledOnce);
        assert.deepEqual(optimizeStub.firstCall.args[0], {
            apiKey: 'test-optimize-key',
        });
        assert.isTrue(mockBaseClient.$extends.calledOnce);
    });

    it('should save prisma reference to global in development', () => {
        process.env.DATABASE_URL = 'test-database-url';
        process.env.NODE_ENV = 'development';

        proxyquire('../../dist/app/src/core/prisma', {
            '@prisma/client': {
                PrismaClient: prismaStub,
            },
            '@prisma/extension-optimize': {
                withOptimize: optimizeStub,
            },
            'dotenv': {
                config: sinon.stub(),
            }
        });

        assert.isDefined(global.prisma);
    });

    it('should not save prisma reference to global in production', () => {
        process.env.DATABASE_URL = 'test-database-url';
        process.env.NODE_ENV = 'production';

        proxyquire('../../dist/app/src/core/prisma', {
            '@prisma/client': {
                PrismaClient: prismaStub,
            },
            '@prisma/extension-optimize': {
                withOptimize: optimizeStub,
            },
            'dotenv': {
                config: sinon.stub(),
            }
        });

        assert.isUndefined(global.prisma);
    });
});
