const router = require('express').Router({
    caseSensitive: true,
    strict: true
});

const controller = require(__basedir + 'app/src/controller');

const errorHandler = fn => (req, res) => {
    try {
        fn(req, res);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: false,
            statusMessage: '500 - Internal server error'
        });
    }
};

module.exports = function (app) {
    app.use('/', router);
    router.get('/live', errorHandler(controller.live));
    router.get('/live/:matchId', errorHandler(controller.matchStats));
}

