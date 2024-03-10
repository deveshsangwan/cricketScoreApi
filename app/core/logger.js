const config   = require(__basedir + 'app/core/configuration');
const winston  = require('winston');

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.label({label:config.get('logging:label')}),
        winston.format.errors({stack: true}),
        winston.format.timestamp({format: 'YYYY-MM-DD hh:mm:ss'}),
        winston.format.printf(({ timestamp, label, level, message, meta, stack }) => {
            const text = '[' + timestamp + '] ' +
            label + '.' + level.toUpperCase() + ': ' + (message ? message :
                '') +(meta && Object.keys(meta).length ?
                '\n' + JSON.stringify(meta, null, 4) :
                '');
            return stack ? text + '\n' + stack : text;
        }),
        winston.format.colorize({ all: true }),
    ),
    transports: [
        new winston.transports.Console({
            level: config.get('logging:consoleLevel'),
            handleExceptions: true,
        }),
    ]
});

const writeLogInfo = (arr) => {
    return logger.info(
        arr
    );
};

const writeLogError = (arr) => {
    return logger.error (
        arr
    );
};

/** Return Logger instances */
module.exports = {
    writeLogInfo    : writeLogInfo,
    writeLogError   : writeLogError
};