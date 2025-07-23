// import { z } from 'zod';
import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { getAuth } from '@clerk/express';
// Import the shared service functions from controller
import { writeLogInfo } from '@core/Logger';
import { LiveMatches } from '@/services/LiveMatches';

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
// const getMatchStatsByIdInput = z.object({
//   matchId: z.string().min(1, 'Match ID is required'),
// });

export const appRouter = router({
  // Get live matches - using shared service
  getLiveMatches: protectedProcedure
    .query(async () => {
      try {
        const liveMatchesObj = new LiveMatches();
        const liveMatchesResponse = (await liveMatchesObj.getMatches());
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
  // getMatchStats: protectedProcedure
  //   .query(async () => {
  //     try {
  //       return await allMatchStatsService();
  //     } catch (error) {
  //       throw new TRPCError({
  //         code: 'INTERNAL_SERVER_ERROR',
  //         message: error instanceof Error ? error.message : 'Error fetching match stats',
  //       });
  //     }
  //   }),

  // Get match stats by ID - using shared service
  // getMatchStatsById: protectedProcedure
  //   .input(getMatchStatsByIdInput)
  //   .query(async ({ input }: { input: z.infer<typeof getMatchStatsByIdInput> }) => {
  //     try {
  //       const { matchId } = input;
  //       return await matchStatsByIdService(matchId);
  //     } catch (error) {
  //       throw new TRPCError({
  //         code: 'INTERNAL_SERVER_ERROR',
  //         message: error instanceof Error ? error.message : 'Error fetching match stats',
  //       });
  //     }
  //   }),
});

// Export the router type - this is important for the frontend
export type AppRouter = typeof appRouter; 