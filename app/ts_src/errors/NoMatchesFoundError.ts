export class NoMatchesFoundError extends Error {
    constructor() {
        super('No matches found');
        this.name = 'NoMatchesFoundError';
    }
}