global.__basedir = process.cwd() + '/';
const port = process.env.NODE_PORT || 3000;
const app           = require('../app/app.js');
//const config = require(__basePath + 'app/core/configuration');
//const port = process.env.NODE_PORT || config.get('server:index:port');

app.listen(port, function () {
    console.log(`Running on port: ${port}`);
});