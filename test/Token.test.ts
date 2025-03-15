import { assert } from 'chai';
import sinon from 'sinon';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Token } from '../app/dist/services/Token';
import * as Logger from '../app/dist/core/Logger';
import config from '../app/dist/core/configuration';

describe('Token', () => {
    let sandbox: sinon.SinonSandbox;
    const validSecret = 'test-secret';
    const validClientId = 'test-client-id';
    const validClientSecret = 'test-client-secret';
    const validTokenExpiry = '1h';

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock environment variables
        process.env.SECRET_KEY = validSecret;
        process.env.CLIENT_ID = validClientId;
        process.env.CLIENT_SECRET = validClientSecret;

        // Mock config
        sandbox.stub(config, 'get').returns(validTokenExpiry);

        // Mock logger
        sandbox.stub(Logger, 'writeLogError');
    });

    afterEach(() => {
        sandbox.restore();
        delete process.env.SECRET_KEY;
        delete process.env.CLIENT_ID;
        delete process.env.CLIENT_SECRET;
    });

    describe('constructor', () => {
        it('should initialize successfully with valid environment variables', () => {
            assert.doesNotThrow(() => new Token());
        });

        it('should throw error when environment variables are missing', () => {
            delete process.env.SECRET_KEY;
            assert.throws(() => new Token(), 'Missing required environment variables');
        });
    });

    describe('generateToken', () => {
        let token: Token;

        beforeEach(() => {
            token = new Token();
        });

        it('should generate valid token with correct credentials', () => {
            const credentials = {
                clientId: validClientId,
                clientSecret: validClientSecret,
            };

            const jwtSignStub = sandbox.stub(jwt, 'sign').callsFake(() => 'valid-token');
            sandbox.stub(Date, 'now').returns(Date.parse('2025-10-01T00:00:00Z'));

            const result = token.generateToken(credentials);
            const expectedResult = { token: 'valid-token', expiresAt: '2025-10-01T01:00:00.000Z' };
            assert.deepEqual(result, expectedResult);
            assert.isTrue(jwtSignStub.calledOnce);
            assert.deepEqual(jwtSignStub.firstCall.args[0], { clientId: validClientId });
            assert.equal(jwtSignStub.firstCall.args[1], validSecret);
            assert.deepEqual(jwtSignStub.firstCall.args[2], {
                algorithm: 'HS256' as jwt.Algorithm,
                expiresIn: validTokenExpiry,
            } as SignOptions);
        });

        it('should throw error with invalid clientId', () => {
            const credentials = {
                clientId: 'invalid-client-id',
                clientSecret: validClientSecret,
            };

            assert.throws(() => token.generateToken(credentials), 'Invalid credentials');
        });

        it('should throw error with invalid clientSecret', () => {
            const credentials = {
                clientId: validClientId,
                clientSecret: 'invalid-client-secret',
            };

            assert.throws(() => token.generateToken(credentials), 'Invalid credentials');
        });

        it('should handle jwt.sign errors', () => {
            const credentials = {
                clientId: validClientId,
                clientSecret: validClientSecret,
            };

            const error = new Error('JWT sign error');
            sandbox.stub(jwt, 'sign').throws(error);

            assert.throws(() => token.generateToken(credentials), error.message);
        });
    });
});
