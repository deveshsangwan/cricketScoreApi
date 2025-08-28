import { z } from 'zod';

// Zod schema for MatchData, used for validation
export const MatchDataSchema = z.object({
    matchId: z.string(),
    matchUrl: z.string().url(),
    matchName: z.string(),
});

// TypeScript type inferred from the Zod schema
export type MatchData = z.infer<typeof MatchDataSchema>;

// Zod schema for the live matches response from the database
export const LiveMatchesDbResponseSchema = z.object({
    id: z.string(),
    matchUrl: z.string().url(),
    matchName: z.string(),
});

// TypeScript type for the database response
export type LiveMatchesDbResponse = z.infer<typeof LiveMatchesDbResponseSchema>;
