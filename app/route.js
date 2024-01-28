const express = require('express');
const router = express.Router();
const path = require('path');

const controller = require(path.join(__dirname, 'src', 'controller'));

const errorHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res);
    } catch (err) {
        console.error('An error occurred:', err);
        res.status(err.statusCode || 500);
        return res.json({
            status: false,
            statusMessage: res.statusCode + ' - ' + err.message,
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