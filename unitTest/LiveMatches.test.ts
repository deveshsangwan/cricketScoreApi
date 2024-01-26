import { log } from "console";

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/app.js'); // adjust this path to your server file
const expect = chai.expect;

chai.use(chaiHttp);

describe('LiveMatches API', function () {
    it('should GET all the live matches', function (done) {
        chai.request(server)
            .get('/live') // adjust this path to your API endpoint
            .end(function (err, res) {
                // log(res.body);
                // recieve status as true and response is an object that contains key value pairs of matchId and value contais matchUrl and matchName
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('status').eql(true);
                expect(res.body.response).to.be.a('object');
                /* sample response
                {
                    status: true,
                    message: 'Live Matches',
                    response: {
                        pgWDnYlXaB6cntl4: {
                        matchUrl: '/live-cricket-scores/86821/ken-vs-mwi-2nd-semi-final-africa-cricket-association-cup-2023',
                        matchName: 'Kenya vs Malawi'
                        },
                        Q8bWFoWODbuydcWQ: {
                        matchUrl: '/live-cricket-scores/86814/bw-vs-uga-1st-semi-final-africa-cricket-association-cup-2023',
                        matchName: 'Botswana vs Uganda'
                        }
                    }
                }
                key is the matchId, a random string,
                but value should be an object that contains matchUrl and matchName
                */
                // loop through the response object and check if each value is an object that contains matchUrl and matchName
                for (let key in res.body.response) {
                    expect(res.body.response[key]).to.be.a('object');
                    expect(res.body.response[key]).to.have.property('matchUrl');
                    expect(res.body.response[key]).to.have.property('matchName');
                }
                done();
            });
    });
});