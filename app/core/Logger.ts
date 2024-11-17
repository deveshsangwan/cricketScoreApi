import config from './configuration';
import winston from 'winston';

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.label({ label: config.get('logging:label') as string }),
        winston.format.errors({ stack: true }),
        winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }),
        winston.format.printf(({ timestamp, label, level, message, meta, stack }) => {
            const text = '[' + timestamp + '] ' +
                label + '.' + level.toUpperCase() + ': ' + (message ?? '') + (meta && Object.keys(meta).length ? '\n' + JSON.stringify(meta, null, 4) : '');
            return stack ? text + '\n' + stack : text;
        }),
        winston.format.colorize({ all: true }),
    ),
    transports: [
        new winston.transports.Console({
            level: config.get('logging:consoleLevel') as string,
            handleExceptions: true,
        }),
    ]
});

export const writeLogInfo = (arr: unknown[]): void => {
    logger.info(
        arr
    );
};

export const writeLogError = (arr: unknown[]): void => {
    logger.error(
        arr
    );
};