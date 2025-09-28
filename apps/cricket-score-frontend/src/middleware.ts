import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip next internal paths and static files
    "/((?!_next|.*\..*|favicon.ico).*)",
  ],
};