import config from './configuration';
import winston from 'winston';

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.label({ label: config.get('logging:label') as string }),
        winston.format.errors({ stack: true }),
        winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }),
        winston.format.printf(({ timestamp, label, level, message, meta, stack }) => {
            let log = `${timestamp} [${label as string}] ${level}: ${message as string}`;
            if (meta && Object.keys(meta).length > 0) {
                log += `\n${JSON.stringify(meta, null, 2)}`;
            }
            if (stack) {
                log += `\n${stack as string}`;
            }
            return log;
        }),
        winston.format.colorize({ all: true })
    ),
    transports: [
        new winston.transports.Console({
            level: config.get('logging:consoleLevel') as string,
            handleExceptions: true,
        }),
    ],
});

export const writeLogInfo = (arr: unknown[]): void => {
    logger.info({ message: String(arr[0]), meta: arr.slice(1) });
};

export const writeLogError = (arr: unknown[]): void => {
    logger.error({ message: String(arr[0]), meta: arr.slice(1) });
};

// Enhanced debugging functions
export const writeLogDebug = (arr: unknown[]): void => {
    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
        return;
    }
    logger.debug({ message: String(arr[0]), meta: arr.slice(1) });
};

// Structured logging for API requests
export const logAPIRequest = (method: string, url: string, userId?: string, body?: any): void => {
    logger.info('API_REQUEST', {
        method,
        url,
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString(),
        ...(body && Object.keys(body).length && { body }),
    });
};

// Structured logging for API responses
export const logAPIResponse = (
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    error?: string
): void => {
    const logLevel = statusCode >= 400 ? 'error' : 'info';
    logger[logLevel]('API_RESPONSE', {
        method,
        url,
        statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        ...(error && { error }),
    });
};

// Performance monitoring
export const logPerformance = (operation: string, duration: number, metadata?: any): void => {
    logger.info({
        message: 'PERFORMANCE',
        meta: {
            operation,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            ...(metadata && { metadata }),
        },
    });
};

// Database operation logging
export const logDatabaseOperation = (
    operation: string,
    table: string,
    success: boolean,
    duration?: number,
    error?: string
): void => {
    const logLevel = success ? 'info' : 'error';
    logger[logLevel]({
        message: 'DATABASE_OPERATION',
        meta: {
            operation,
            table,
            success,
            timestamp: new Date().toISOString(),
            ...(duration && { duration: `${duration}ms` }),
            ...(error && { error }),
        },
    });
};

// External API call logging
export const logExternalAPICall = (
    url: string,
    method: string,
    statusCode?: number,
    duration?: number,
    error?: string
): void => {
    const logLevel = error || (statusCode && statusCode >= 400) ? 'error' : 'info';
    logger[logLevel]({
        message: 'EXTERNAL_API_CALL',
        meta: {
            url,
            method,
            timestamp: new Date().toISOString(),
            ...(statusCode && { statusCode }),
            ...(duration && { duration: `${duration}ms` }),
            ...(error && { error }),
        },
    });
};

// Service operation logging
export const logServiceOperation = (
    service: string,
    operation: string,
    success: boolean,
    duration?: number,
    metadata?: any
): void => {
    const logLevel = success ? 'info' : 'error';
    logger[logLevel]({
        message: 'SERVICE_OPERATION',
        meta: {
            service,
            operation,
            success,
            timestamp: new Date().toISOString(),
            ...(duration && { duration: `${duration}ms` }),
            ...(metadata && { metadata }),
        },
    });
};
