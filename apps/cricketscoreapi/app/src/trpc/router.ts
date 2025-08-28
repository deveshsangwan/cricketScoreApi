import { z } from 'zod';
import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { getAuth } from '@clerk/express';
// Service-layer imports
import { writeLogInfo } from '@core/Logger';
import { LiveMatches } from '@services/LiveMatches';
import { MatchStats } from '@services/MatchStats';
import type { MatchStatsResponse } from '@types';

// Create context function for tRPC
export function createContext({ req }: CreateExpressContextOptions) {
    const auth = getAuth(req);
    return {
        auth,
        req,
    };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC with context
const t = initTRPC.context<Context>().create();

// Create router and procedures
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    const { auth, req } = ctx;

    writeLogInfo([
        `tRPC Request: ${req.method} ${req.originalUrl} - User ID: ${auth?.userId || 'Not Authenticated'}`,
    ]);

    if (!auth || !auth.userId) {
        writeLogInfo([
            `tRPC Authentication failed for: ${req.method} ${req.originalUrl} - IP: ${req.ip}`,
        ]);
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Authentication Failed',
        });
    }

    writeLogInfo([
        `tRPC Authentication successful for: ${req.method} ${req.originalUrl} - User: ${auth.userId}`,
    ]);

    return next({
        ctx: {
            ...ctx,
            auth: auth, // auth is now guaranteed to be defined
        },
    });
});

// Input validation schema for getMatchStatsById
// Enforce exactly 16 alphanumeric characters for match IDs
const MATCH_ID_REGEX = /^[A-Za-z0-9]{16}$/;
const getMatchStatsByIdInput = z.object({
    matchId: z
        .string()
        .trim()
        .regex(MATCH_ID_REGEX, 'Match ID must be 16 alphanumeric characters'),
});

// Module-level counters (top of file after imports)
let activeSubscriberCount = 0;
const activeSubscribersByMatch = new Map<string, number>();

export const appRouter = router({
    // Get live matches - using shared service
    getLiveMatches: protectedProcedure.query(async () => {
        try {
            const liveMatchesObj = new LiveMatches();
            const liveMatchesResponse = await liveMatchesObj.getMatches();
            return {
                status: true,
                message: 'Live Matches',
                response: liveMatchesResponse,
            };
        } catch (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error instanceof Error ? error.message : 'Error fetching live matches',
            });
        }
    }),

    // Get match stats (all matches) - using shared service
    getMatchStats: protectedProcedure.query(async () => {
        try {
            const matchStatsObj = new MatchStats();
            const matchStatsResponse = (await matchStatsObj.getMatchStats(
                '0'
            ));
            return {
                status: true,
                message: 'Match Stats',
                response: matchStatsResponse,
            };
        } catch (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error instanceof Error ? error.message : 'Error fetching match stats',
            });
        }
    }),

    // Get match stats by ID - using shared service
    getMatchStatsById: protectedProcedure
        .input(getMatchStatsByIdInput)
        .query(async ({ input }: { input: z.infer<typeof getMatchStatsByIdInput> }) => {
            try {
                const { matchId } = input;
                const matchStatsObj = new MatchStats();
                const result = (await matchStatsObj.getMatchStats(
                    matchId
                ));
                if (Array.isArray(result)) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Expected a single match stats object for a matchId',
                    });
                }
                const matchStatsResponse = result;
                return {
                    status: true,
                    message: 'Match Stats',
                    response: matchStatsResponse,
                };
            } catch (error) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error instanceof Error ? error.message : 'Error fetching match stats',
                });
            }
        }),

    // Subscribe to match stats by ID (SSE-based subscription)
    subscribeMatchStatsById: protectedProcedure
        .input(
            z.object({
                matchId: z.string().min(1, 'Match ID is required').regex(MATCH_ID_REGEX, 'Match ID must be 16 alphanumeric characters'),
            })
        )
        .subscription(async function* ({ input, signal }) {
            const { matchId } = input;
            const matchStatsObj = new MatchStats();

            // increment on connect
            let released = false;
            const release = () => {
                if (released) return;
                released = true;
                activeSubscriberCount = Math.max(0, activeSubscriberCount - 1);
                const next = (activeSubscribersByMatch.get(matchId) ?? 1) - 1;
                if (next <= 0) activeSubscribersByMatch.delete(matchId);
                else activeSubscribersByMatch.set(matchId, next);
            };

            activeSubscriberCount += 1;
            activeSubscribersByMatch.set(matchId, (activeSubscribersByMatch.get(matchId) ?? 0) + 1);
            signal?.addEventListener('abort', release, { once: true });
            console.log('activeSubscriberCount', activeSubscriberCount);
            console.log('activeSubscribersByMatch', activeSubscribersByMatch);

            // Abortable sleep
            const abortableSleep = (ms: number, signal?: AbortSignal) =>
                new Promise<void>((resolve) => {
                    if (!signal) return setTimeout(resolve, ms);
                    if (signal.aborted) return resolve();
                    const t = setTimeout(() => {
                        signal.removeEventListener('abort', onAbort);
                        resolve();
                    }, ms);
                    function onAbort() {
                        clearTimeout(t);
                        resolve();
                    }
                    signal.addEventListener('abort', onAbort, { once: true });
                });

            try {
                const initial = (await matchStatsObj.getMatchStats(matchId)) as MatchStatsResponse;
                yield { status: true, message: 'Match Stats', response: initial };

                while (!signal?.aborted) {
                    const base = 25000;
                    const jitter = Math.floor(Math.random() * 3000);
                    await abortableSleep(base + jitter, signal);
                    if (signal?.aborted) break;

                    const latest = (await matchStatsObj.getMatchStats(matchId)) as MatchStatsResponse;
                    yield { status: true, message: 'Match Stats', response: latest };
                }
            } finally {
                console.log('release called');
                // Ensure abort listener is removed to avoid leaks for long-lived subscriptions
                if (signal) {
                    signal.removeEventListener('abort', release);
                }
                release();
            }
        }),
});

// Export the router type - this is important for the frontend
export type AppRouter = typeof appRouter;
