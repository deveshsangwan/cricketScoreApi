import { appRouter } from '../app/src/trpc/router';
import type { AppRouter } from '../app/src/trpc/router';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.TEST_USER_TOKEN) {
    throw new Error('TEST_USER_TOKEN is not set in environment variables.');
}

export interface TrpcTestResponse<T = any> {
    data?: T;
    error?: any;
    status: 'success' | 'error';
}

class TrpcClient {
    private skipAuth: boolean;

    constructor(skipAuth: boolean = false) {
        this.skipAuth = skipAuth;
    }

    private createMockContext() {
        // Create a mock context with proper auth structure
        const mockAuth = this.skipAuth
            ? undefined
            : {
                  userId: 'test-user-id',
                  sessionId: 'test-session-id',
                  sessionClaims: {},
                  getToken: () => Promise.resolve(process.env.TEST_USER_TOKEN),
                  debug: () => ({}),
                  protect: () => ({}),
                  redirectToSignIn: () => {},
              };

        const mockReq = {
            method: 'POST',
            originalUrl: '/trpc',
            ip: '127.0.0.1',
            headers: {
                authorization: this.skipAuth ? undefined : `Bearer ${process.env.TEST_USER_TOKEN}`,
                origin: 'http://local.deveshsangwan.com:3000',
            },
        };

        return {
            auth: mockAuth,
            req: mockReq,
        } as any; // Type assertion to bypass strict typing for testing
    }

    public async getLiveMatches(): Promise<TrpcTestResponse> {
        try {
            const ctx = this.createMockContext();
            const caller = appRouter.createCaller(ctx);
            const data = await caller.getLiveMatches();
            return {
                data,
                status: 'success',
            };
        } catch (error) {
            return {
                error,
                status: 'error',
            };
        }
    }

    public async getMatchStats(): Promise<TrpcTestResponse> {
        try {
            const ctx = this.createMockContext();
            const caller = appRouter.createCaller(ctx);
            const data = await caller.getMatchStats();
            return {
                data,
                status: 'success',
            };
        } catch (error) {
            return {
                error,
                status: 'error',
            };
        }
    }

    public async getMatchStatsById(matchId: string): Promise<TrpcTestResponse> {
        try {
            const ctx = this.createMockContext();
            const caller = appRouter.createCaller(ctx);
            const data = await caller.getMatchStatsById({ matchId });
            return {
                data,
                status: 'success',
            };
        } catch (error) {
            return {
                error,
                status: 'error',
            };
        }
    }
}

export default TrpcClient;
