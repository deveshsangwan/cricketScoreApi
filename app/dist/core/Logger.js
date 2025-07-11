"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logServiceOperation = exports.logExternalAPICall = exports.logDatabaseOperation = exports.logPerformance = exports.logAPIResponse = exports.logAPIRequest = exports.writeLogWarn = exports.writeLogDebug = exports.writeLogError = exports.writeLogInfo = void 0;
const configuration_1 = __importDefault(require("./configuration"));
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    format: winston_1.default.format.combine(winston_1.default.format.label({ label: configuration_1.default.get('logging:label') }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }), winston_1.default.format.printf(({ timestamp, label, level, message, meta, stack }) => {
        let log = `${timestamp} [${label}] ${level}: ${message}`;
        if (meta && Object.keys(meta).length > 0) {
            log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        if (stack) {
            log += `\n${stack}`;
        }
        return log;
    }), winston_1.default.format.colorize({ all: true })),
    transports: [
        new winston_1.default.transports.Console({
            level: configuration_1.default.get('logging:consoleLevel'),
            handleExceptions: true,
        }),
    ],
});
const writeLogInfo = (arr) => {
    logger.info({ message: String(arr[0]), meta: arr.slice(1) });
};
exports.writeLogInfo = writeLogInfo;
const writeLogError = (arr) => {
    logger.error({ message: String(arr[0]), meta: arr.slice(1) });
};
exports.writeLogError = writeLogError;
// Enhanced debugging functions
const writeLogDebug = (arr) => {
    console.log('=====process.env.NODE_ENV======', process.env.NODE_ENV);
    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
        return;
    }
    logger.debug({ message: String(arr[0]), meta: arr.slice(1) });
};
exports.writeLogDebug = writeLogDebug;
const writeLogWarn = (arr) => {
    logger.warn({ message: String(arr[0]), meta: arr.slice(1) });
};
exports.writeLogWarn = writeLogWarn;
// Structured logging for API requests
const logAPIRequest = (method, url, userId, body) => {
    logger.info('API_REQUEST', {
        method,
        url,
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString(),
        ...(body && Object.keys(body).length && { body }),
    });
};
exports.logAPIRequest = logAPIRequest;
// Structured logging for API responses
const logAPIResponse = (method, url, statusCode, duration, error) => {
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
exports.logAPIResponse = logAPIResponse;
// Performance monitoring
const logPerformance = (operation, duration, metadata) => {
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
exports.logPerformance = logPerformance;
// Database operation logging
const logDatabaseOperation = (operation, table, success, duration, error) => {
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
exports.logDatabaseOperation = logDatabaseOperation;
// External API call logging
const logExternalAPICall = (url, method, statusCode, duration, error) => {
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
exports.logExternalAPICall = logExternalAPICall;
// Service operation logging
const logServiceOperation = (service, operation, success, duration, metadata) => {
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
exports.logServiceOperation = logServiceOperation;
//# sourceMappingURL=Logger.js.map