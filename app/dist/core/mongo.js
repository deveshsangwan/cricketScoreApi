"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./logger");
dotenv_1.default.config();
class Mongo {
    connection;
    constructor() {
        this._connect();
    }
    async _connect() {
        if (this.connection) {
            return this.connection;
        }
        const mongoUrl = process.env.MONGO_URL || '';
        try {
            this.connection = await mongoose_1.default.connect(mongoUrl);
            (0, logger_1.writeLogInfo)(['Database connection successful']);
        }
        catch (err) {
            (0, logger_1.writeLogError)(['Database connection error', err]);
        }
    }
}
exports.default = new Mongo();
//# sourceMappingURL=mongo.js.map