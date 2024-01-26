const nconf   = require('nconf');
const nodeEnv = process.env.NODE_ENV || 'development';

nconf.argv().env();
nconf.file('config', __basedir + `app/config/config.${nodeEnv}.json`);
nconf.file('responseMessage', __basedir + 'app/config/responseMessage.json');
nconf.file('partners', __basedir + 'app/config/partners.json');

module.exports = nconf;