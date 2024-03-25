"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const Logger_1 = require("./Logger");
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
            (0, Logger_1.writeLogInfo)(['Database connection successful']);
        }
        catch (err) {
            (0, Logger_1.writeLogError)(['Database connection error', err]);
        }
    }
}
exports.default = new Mongo();
//# sourceMappingURL=Mongo.js.map