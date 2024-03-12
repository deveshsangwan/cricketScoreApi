import jwt from 'jsonwebtoken';
import { writeLogError } from '../core/logger';
import { CustomError } from './errors';
import dotenv from 'dotenv';
import config from '../core/configuration';

dotenv.config();

interface ClientCredentials {
    clientId: string;
    clientSecret: string;
  }

export class Token {
    private secret: string;
    private expiresIn: string;
    private clientId: string;
    private clientSecret: string;

    constructor() {
        this.secret = process.env.SECRET_KEY;
        this.expiresIn = config.get('tokenExpiry');
        this.clientId = process.env.CLIENT_ID;
        this.clientSecret = process.env.CLIENT_SECRET;
    }

    private handleError(location: string, error: Error): never {
        writeLogError([`${location} | error`, error]);
        throw new CustomError(error.message);
    }
    
    public generateToken(credentials: ClientCredentials): string | never {
        try {
            const { clientId, clientSecret } = credentials;
    
            if (clientId === this.clientId && clientSecret === this.clientSecret) {
                const payload = {
                    clientId
                };
    
                const token = jwt.sign(payload, this.secret, { algorithm: 'HS256', expiresIn: this.expiresIn });
                return token;
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            this.handleError('Token | generateToken', error);
        }
    }
}