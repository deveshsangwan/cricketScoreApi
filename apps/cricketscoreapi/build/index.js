// Register tsconfig-paths with explicit paths for dist folder
require('tsconfig-paths').register({
    baseUrl: process.cwd(),
    paths: {
        "@/*": ["dist/app/src/*"],
        "@api/*": ["dist/app/src/api/*"],
        "@core/*": ["dist/app/src/core/*"],
        "@errors": ["dist/app/src/errors/index"],
        "@schema/*": ["dist/app/src/schema/*"],
        "@services/*": ["dist/app/src/services/*"],
        "@types": ["dist/app/src/types/index"],
        "@utils/*": ["dist/app/src/utils/*"]
    }
});

global.__basedir = process.cwd() + '/';
const port = process.env.NODE_PORT || 3001;
const app = require(__basedir + 'dist/app/src/app.js').default;
const { writeLogInfo } = require(__basedir + 'dist/app/src/core/Logger');
//const config = require(__basedir + 'app/core/configuration');
//const port = process.env.NODE_PORT || config.get('server:index:port');

app.listen(port, function () {
    writeLogInfo([`Running on port: ${port}`]);
});