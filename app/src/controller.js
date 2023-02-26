"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LiveMatches_1 = require("./LiveMatches/LiveMatches");
const live = function (req, res) {
    console.log('live');
    const liveMatchesObj = new LiveMatches_1.LiveMatches();
    const liveMatchesResponse = liveMatchesObj.getMatches();
    console.log('liveMatchesResponse', liveMatchesResponse);
    // console.log(req);
    return res.status(200).send({
        status: true,
        message: 'Live Matches',
        response: liveMatchesResponse
    });
};
exports.live = live;
