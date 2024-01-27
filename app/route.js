const router = require('express').Router({
    caseSensitive: true,
    strict: true
});

const controller = require(__basedir + 'app/src/controller');

const errorHandler = (fn) => async (req, res) => {
    try {
        await fn(req, res);
    } catch (err) {
        console.error('An error occurred:', err);
        return res.status(500).json({
            status: false,
            statusMessage: '500 - Internal server error',
            errorMessage: err.message
        });
    }
};

module.exports = function (app) {
    app.use('/', router);
    router.get('/liveMatches', errorHandler(controller.live));
    router.get('/matchStats/:matchId', errorHandler(controller.matchStats));
    router.get('/matchStats', errorHandler(controller.getMatchStats));
}

