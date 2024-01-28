import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../app/app.js';

chai.use(chaiHttp);

export function apiCall(endpoint: string): Promise<any> {
    return new Promise((resolve, reject) => {
        chai.request(server)
            .get(endpoint)
            .end(function (err, res) {
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