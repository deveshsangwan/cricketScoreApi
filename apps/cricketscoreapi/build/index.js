// Register tsconfig-paths with explicit paths for dist folder
require('tsconfig-paths').register({
    baseUrl: process.cwd(),
    paths: {
        "@/*": ["app/dist/app/src/*"],
        "@api/*": ["app/dist/app/src/api/*"],
        "@core/*": ["app/dist/app/src/core/*"],
        "@errors": ["app/dist/app/src/errors/index"],
        "@schema/*": ["app/dist/app/src/schema/*"],
        "@services/*": ["app/dist/app/src/services/*"],
        "@types": ["app/dist/app/src/types/index"],
        "@utils/*": ["app/dist/app/src/utils/*"]
    }
});

global.__basedir = process.cwd() + '/';
const port = process.env.NODE_PORT || 3001;
const app = require(__basedir + 'app/dist/app/src/app.js').default;
const { writeLogInfo } = require(__basedir + 'app/dist/app/src/core/Logger');
//const config = require(__basedir + 'app/core/configuration');
//const port = process.env.NODE_PORT || config.get('server:index:port');

app.listen(port, function () {
    writeLogInfo([`Running on port: ${port}`]);
});