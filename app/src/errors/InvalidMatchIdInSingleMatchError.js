"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidMatchIdInSingleMatchError = void 0;
class InvalidMatchIdInSingleMatchError extends Error {
    constructor(matchId) {
        super(`Match Id is invalid: ${matchId}`);
        this.name = 'InvalidMatchIdInSingleMatchError';
    }
}
exports.InvalidMatchIdInSingleMatchError = InvalidMatchIdInSingleMatchError;
