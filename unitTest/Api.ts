import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../app/app.js';
import { Token } from '../app/dist/Token';
import dotenv from 'dotenv';

dotenv.config();

chai.use(chaiHttp);

async function getToken(): Promise<string> {
    const tokenObj = new Token();
    const token = tokenObj.generateToken({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET});
    return token;
}

export async function apiCall(endpoint: string): Promise<any> {
    const token = await getToken();

    return new Promise((resolve, reject) => {
        chai.request(server)
            .get(endpoint)
            .set('Authorization', `Bearer ${token}`)
            .end(function (err, res) {
                console.log('res', res.status, res.body);
                if (err) {
                    console.error(err);
                    reject(err);
                } else if (res.status === 200) {
                    resolve(res.body);
                } else {
                    resolve(res);
                }
            });
    });
}