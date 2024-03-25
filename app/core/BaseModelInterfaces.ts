import { Document } from 'mongoose';

export interface ILiveMatches extends Document {
    _id: string;
    matchUrl: string;
    matchName: string;
}

export interface IMatchStats extends Document {
    createdAt: Date;
    _id: string;
    team1: object;
    team2: object;
    onBatting: object;
    summary: object;
    tournamentName: string;
    matchName: string;
}