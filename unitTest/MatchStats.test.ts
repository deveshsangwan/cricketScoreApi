import { log } from "console";

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/app.js'); // adjust this path to your server file
const expect = chai.expect;

chai.use(chaiHttp);

describe('MatchStats API', function () {
    it('should GET a specific match by id', function (done) {
        const id = 'nLSAYi2BckuKRVA8'; // replace with a valid match id
        chai.request(server)
            .get(`/live/${id}`) // adjust this path to your API endpoint
            .end(function (err, res) {
                // log(res.body);
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                // expect(res.body).to.have.property('matchId').eql(id);
                done();
            });
    });

    it('should GET stats of all the live matches', function (done) {
        this.timeout(5000);
        chai.request(server)
            .get('/live1') // adjust this path to your API endpoint
            .end(function (err, res) {
                // log(res.body);
                // recieve status as true and response is an object that contains key value pairs of matchId and value contais matchUrl and matchName
                expect(res).to.have.status(200);
                done();
            });
    });
});