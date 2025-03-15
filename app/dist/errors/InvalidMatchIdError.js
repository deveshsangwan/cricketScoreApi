"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidMatchIdError = void 0;
class InvalidMatchIdError extends Error {
    constructor(matchId) {
        super(`Invalid match id: ${matchId}`);
        this.name = 'InvalidMatchIdError';
    }
}
exports.InvalidMatchIdError = InvalidMatchIdError;
//# sourceMappingURL=InvalidMatchIdError.js.map