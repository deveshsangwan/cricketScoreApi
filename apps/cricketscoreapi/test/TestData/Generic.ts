export const testData = {
    invalidRoute: {
        route: '/live',
        expectedOutput: { status: false, statusMessage: '404 - Page not found' },
    },
    cors: {
        route: '/liveMatches',
    },
};
