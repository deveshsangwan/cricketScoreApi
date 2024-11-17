const express = require('express');
const router = express.Router();
const path = require('path');
const rateLimit = require('express-rate-limit');

const controller = require(path.join(__dirname, 'dist/src', 'controller'));

const generateTokenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests created from this IP, please try again after 15 minutes'
});

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
    router.post('/generateToken', generateTokenLimiter, errorHandler(controller.generateToken));
    router.get('/liveMatches', errorHandler(controller.live));
    router.get('/matchStats/:matchId', errorHandler(controller.matchStats));
    router.get('/matchStats', errorHandler(controller.getMatchStats));
};