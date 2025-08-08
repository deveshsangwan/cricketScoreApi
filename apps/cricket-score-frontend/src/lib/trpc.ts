import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@cricketscoreapi/trpc/router';

export const trpc = createTRPCReact<AppRouter>();