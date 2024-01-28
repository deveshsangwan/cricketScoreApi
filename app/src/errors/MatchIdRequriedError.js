"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchIdRequriedError = void 0;
class MatchIdRequriedError extends Error {
    constructor() {
        super('Match Id is required');
        this.name = 'MatchIdRequriedError';
    }
}
exports.MatchIdRequriedError = MatchIdRequriedError;
