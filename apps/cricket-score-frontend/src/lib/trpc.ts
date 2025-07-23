import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@cricketscoreapi/trpc/types';

export const trpc = createTRPCReact<AppRouter>();