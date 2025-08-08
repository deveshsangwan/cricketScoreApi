import nconf from 'nconf';
import * as path from 'path';

const nodeEnv: string = process.env.NODE_ENV || 'development';
const __basedir: string = path.resolve();

nconf.argv().env();
nconf.file('config', path.join(__basedir, `app/config/config.${nodeEnv}.json`));
nconf.file('responseMessage', path.join(__basedir, 'app/config/responseMessage.json'));
nconf.file('partners', path.join(__basedir, 'app/config/partners.json'));

export default nconf;
