import jwt from 'jsonwebtoken';
import { writeLogError } from '../core/Logger';
import { CustomError } from './errors';
import dotenv from 'dotenv';
import config from '../core/configuration';

dotenv.config();

interface ClientCredentials {
    clientId: string;
    clientSecret: string;
}

export class Token {
    private readonly secret: string;
    private readonly expiresIn: string;
    private readonly clientId: string;
    private readonly clientSecret: string;

    constructor() {
        this.secret = process.env.SECRET_KEY;
        this.expiresIn = config.get('tokenExpiry');
        this.clientId = process.env.CLIENT_ID;
        this.clientSecret = process.env.CLIENT_SECRET;

        if (!this.secret || !this.clientId || !this.clientSecret) {
            throw new Error('Missing required environment variables');
        }
    }

    private handleError(location: string, error: Error): never {
        writeLogError([`${location} | error`, error]);
        throw new CustomError(error.message);
    }

    public generateToken(credentials: ClientCredentials): string {
        try {
            const { clientId, clientSecret } = credentials;

            if (clientId !== this.clientId || clientSecret !== this.clientSecret) {
                throw new Error('Invalid credentials');
            }

            const payload = { clientId };
            return jwt.sign(payload, this.secret, { algorithm: 'HS256', expiresIn: this.expiresIn });
        } catch (error) {
            return this.handleError('Token | generateToken', error as Error);
        }
    }
}