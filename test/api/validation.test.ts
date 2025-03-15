import { assert } from 'chai';
import sinon from 'sinon';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateParams, validateBody } from '../../app/dist/api/validation';

// validation.test.ts

describe('Validation Middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let statusStub: sinon.SinonStub;
    let jsonStub: sinon.SinonStub;

    beforeEach(() => {
        // Setup request and response mocks
        req = {};
        jsonStub = sinon.stub();
        statusStub = sinon.stub().returns({ json: jsonStub });
        res = {
            status: statusStub
        };
        next = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('validateParams', () => {
        const paramsSchema = z.object({
            id: z.string().uuid(),
            page: z.coerce.number().optional()
        });

        it('should call next() when params validation succeeds', () => {
            req.params = {
                id: '123e4567-e89b-12d3-a456-426614174000'
            };

            const middleware = validateParams(paramsSchema);
            middleware(req as Request, res as Response, next);

            assert.isFalse(statusStub.called);
            assert.deepEqual(req.params, {
                id: '123e4567-e89b-12d3-a456-426614174000'
            });
        });

        it('should return 400 with error details when params validation fails', () => {
            req.params = {
                id: 'invalid-uuid',
                page: 'not-a-number'
            };

            const middleware = validateParams(paramsSchema);
            middleware(req as Request, res as Response, next);

            assert.isTrue(statusStub.calledWith(400));
            assert.isTrue(jsonStub.calledOnce);
            
            const response = jsonStub.firstCall.args[0];
            assert.isFalse(response.status);
            assert.equal(response.message, 'Invalid request parameters');
            assert.isArray(response.errors);
        });

        it('should pass non-Zod errors to next()', () => {
            const errorSchema = {
                parse: () => {
                    throw new Error('Non-Zod error');
                }
            } as unknown as z.ZodSchema;

            const middleware = validateParams(errorSchema);
            middleware(req as Request, res as Response, next);

            assert.isFalse(statusStub.called);
        });
    });

    describe('validateBody', () => {
        const bodySchema = z.object({
            name: z.string().min(3),
            email: z.string().email(),
            age: z.number().optional()
        });

        it('should call next() when body validation succeeds', () => {
            req.body = {
                name: 'John Doe',
                email: 'john@example.com',
                age: 30
            };

            const middleware = validateBody(bodySchema);
            middleware(req as Request, res as Response, next);

            assert.isFalse(statusStub.called);
            assert.deepEqual(req.body, {
                name: 'John Doe',
                email: 'john@example.com',
                age: 30
            });
        });

        it('should return 400 with error details when body validation fails', () => {
            req.body = {
                name: 'Jo',
                email: 'not-an-email'
            };

            const middleware = validateBody(bodySchema);
            middleware(req as Request, res as Response, next);

            assert.isTrue(statusStub.calledWith(400));
            assert.isTrue(jsonStub.calledOnce);
            
            const response = jsonStub.firstCall.args[0];
            assert.isFalse(response.status);
            assert.equal(response.message, 'Invalid request body');
            assert.isArray(response.errors);
        });

        it('should pass non-Zod errors to next()', () => {
            const errorSchema = {
                parse: () => {
                    throw new Error('Some other error');
                }
            } as unknown as z.ZodSchema;

            const middleware = validateBody(errorSchema);
            middleware(req as Request, res as Response, next);

            assert.isFalse(statusStub.called);
        });
    });
});