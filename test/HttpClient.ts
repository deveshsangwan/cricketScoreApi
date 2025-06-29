import chaiHttp from 'chai-http';
import server from '../app/dist/app.js';
import { IApiResponse } from './IApiResponse.js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.TEST_USER_TOKEN) {
    throw new Error('TEST_USER_TOKEN is not set in environment variables.');
}

class HttpClient {
    private chai: any;

    constructor(chai: any) {
        this.chai = chai;
        this.chai.use(chaiHttp);
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
            request.set('Authorization', `Bearer ${process.env.TEST_USER_TOKEN}`);

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

            return request.end((err, res) => {
                console.log('res', res.status, res.body);
                if (err) {
                    console.error(err);
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
