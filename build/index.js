global.__basedir = process.cwd() + '/';
const port = process.env.NODE_PORT || 3000;
const app = require(__basedir + 'app/app.js');
const { writeLogInfo } = require(__basedir + 'app/core/logger');
//const config = require(__basedir + 'app/core/configuration');
//const port = process.env.NODE_PORT || config.get('server:index:port');

app.listen(port, function () {
    writeLogInfo([`Running on port: ${port}`]);
});