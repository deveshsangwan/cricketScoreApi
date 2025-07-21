// test/setup.js
global.__basedir = process.cwd() + '/';

// Register path aliases for tests
require('tsconfig-paths').register({
    baseUrl: process.cwd(),
    paths: {
        '@/*': ['app/src/*'],
        '@api/*': ['app/src/api/*'],
        '@core/*': ['app/src/core/*'],
        '@errors': ['app/src/errors/index'],
        '@schema/*': ['app/src/schema/*'],
        '@services/*': ['app/src/services/*'],
        '@types': ['app/src/types/index'],
        '@utils/*': ['app/src/utils/*'],
    },
});
