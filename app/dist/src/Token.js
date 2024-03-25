"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Logger_1 = require("../core/Logger");
const errors_1 = require("./errors");
const dotenv_1 = __importDefault(require("dotenv"));
const configuration_1 = __importDefault(require("../core/configuration"));
dotenv_1.default.config();
class Token {
    secret;
    expiresIn;
    clientId;
    clientSecret;
    constructor() {
        this.secret = process.env.SECRET_KEY;
        this.expiresIn = configuration_1.default.get('tokenExpiry');
        this.clientId = process.env.CLIENT_ID;
        this.clientSecret = process.env.CLIENT_SECRET;
    }
    handleError(location, error) {
        (0, Logger_1.writeLogError)([`${location} | error`, error]);
        throw new errors_1.CustomError(error.message);
    }
    generateToken(credentials) {
        try {
            const { clientId, clientSecret } = credentials;
            if (clientId === this.clientId && clientSecret === this.clientSecret) {
                const payload = {
                    clientId
                };
                const token = jsonwebtoken_1.default.sign(payload, this.secret, { algorithm: 'HS256', expiresIn: this.expiresIn });
                return token;
            }
            else {
                throw new Error('Invalid credentials');
            }
        }
        catch (error) {
            this.handleError('Token | generateToken', error);
        }
    }
}
exports.Token = Token;
//# sourceMappingURL=Token.js.map