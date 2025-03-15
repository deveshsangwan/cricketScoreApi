"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeLogError = exports.writeLogInfo = void 0;
const configuration_1 = __importDefault(require("./configuration"));
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    format: winston_1.default.format.combine(winston_1.default.format.label({ label: configuration_1.default.get('logging:label') }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }), winston_1.default.format.printf(({ timestamp, label, level, message, meta, stack }) => {
        const text = '[' +
            timestamp +
            '] ' +
            label +
            '.' +
            level.toUpperCase() +
            ': ' +
            (message ?? '') +
            (meta && Object.keys(meta).length ? '\n' + JSON.stringify(meta, null, 4) : '');
        return stack ? text + '\n' + stack : text;
    }), winston_1.default.format.colorize({ all: true })),
    transports: [
        new winston_1.default.transports.Console({
            level: configuration_1.default.get('logging:consoleLevel'),
            handleExceptions: true,
        }),
    ],
});
const writeLogInfo = (arr) => {
    logger.info(arr);
};
exports.writeLogInfo = writeLogInfo;
const writeLogError = (arr) => {
    logger.error(arr);
};
exports.writeLogError = writeLogError;
//# sourceMappingURL=Logger.js.map