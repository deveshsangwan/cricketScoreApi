const liveEvents = require('./LiveMatches/LiveMatches');

const live = function (req, res) {
    console.log('live');
    // console.log(req);
    return res.status(200).send({
        status: true,
        message: 'Live Matches',
        response: "conda"
    });
};

exports.live = live;