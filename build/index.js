// Register tsconfig-paths with explicit paths for dist folder
require('tsconfig-paths').register({
    baseUrl: process.cwd(),
    paths: {
        "@/*": ["app/dist/*"],
        "@api/*": ["app/dist/api/*"],
        "@core/*": ["app/dist/core/*"],
        "@errors": ["app/dist/errors/index"],
        "@schema/*": ["app/dist/schema/*"],
        "@services/*": ["app/dist/services/*"],
        "@types": ["app/dist/types/index"],
        "@utils/*": ["app/dist/utils/*"]
    }
});

global.__basedir = process.cwd() + '/';
const port = process.env.NODE_PORT || 3000;
const app = require(__basedir + 'app/dist/app.js').default;
const { writeLogInfo } = require(__basedir + 'app/dist/core/Logger');
//const config = require(__basedir + 'app/core/configuration');
//const port = process.env.NODE_PORT || config.get('server:index:port');

app.listen(port, function () {
    writeLogInfo([`Running on port: ${port}`]);
});