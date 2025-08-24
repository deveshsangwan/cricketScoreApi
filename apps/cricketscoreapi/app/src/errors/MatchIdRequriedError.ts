export class MatchIdRequriedError extends Error {
    constructor() {
        super('Match Id is required');
        this.name = 'MatchIdRequriedError';
    }
}
