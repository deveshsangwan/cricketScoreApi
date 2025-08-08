export class InvalidMatchIdError extends Error {
    constructor(matchId: string) {
        super(`Invalid match id: ${matchId}`);
        this.name = 'InvalidMatchIdError';
    }
}
