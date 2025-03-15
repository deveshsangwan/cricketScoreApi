"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoMatchesFoundError = void 0;
class NoMatchesFoundError extends Error {
    constructor() {
        super('No matches found');
        this.name = 'NoMatchesFoundError';
    }
}
exports.NoMatchesFoundError = NoMatchesFoundError;
//# sourceMappingURL=NoMatchesFoundError.js.map