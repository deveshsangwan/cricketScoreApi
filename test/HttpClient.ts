import chaiHttp from 'chai-http';
import server from '../app/src/app';
import { IApiResponse } from './IApiResponse';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.TEST_USER_TOKEN) {
    throw new Error('TEST_USER_TOKEN is not set in environment variables.');
}

class HttpClient {
    private chai: any;
    private skipAuth: boolean;

    constructor(chai: any, skipAuth: boolean = false) {
        this.chai = chai;
        this.chai.use(chaiHttp);
        this.skipAuth = skipAuth;
    }

    private async executeRequest(
        method: 'get' | 'post',
        endPoint: string,
        headers: { [key: string]: string },
        body?: any,
        params?: { [key: string]: string }
    ): Promise<IApiResponse> {
        return new Promise((resolve, reject) => {
            let request = this.chai.request(server)[method](endPoint);
            if (!this.skipAuth) {
                request.set('Authorization', `Bearer ${process.env.TEST_USER_TOKEN}`);
            }

            if (method === 'post') {
                request = request.send(body);
            }

            // Set each header
            for (let key in headers) {
                request = request.set(key, headers[key]);
            }

            // Set query parameters if provided
            if (params) {
                request = request.query(params);
            }

            return request.end((err: any, res: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    public get(
        endPoint: string,
        headers: { [key: string]: string },
        params?: { [key: string]: string }
    ): Promise<IApiResponse> {
        return this.executeRequest('get', endPoint, headers, undefined, params);
    }

    public post(
        endPoint: string,
        body: any,
        headers: { [key: string]: string },
        params?: { [key: string]: string }
    ): Promise<IApiResponse> {
        return this.executeRequest('post', endPoint, headers, body, params);
    }
}

export default HttpClient;
