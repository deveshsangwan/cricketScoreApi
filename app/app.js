const express = require('express');
const bodyParser = require('body-parser');
const httpContext = require('express-http-context');
const { expressjwt, UnauthorizedError } = require('express-jwt');
require('dotenv').config();

const app = express();

const SECRET_KEY = process.env.SECRET_KEY;

// Middleware for checking JWT
const checkJwt = expressjwt({ secret: SECRET_KEY, algorithms: ['HS256'] });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(httpContext.middleware);

app.use((req, res, next) => {
    httpContext.set('req', req);
    next();
});

// Define your protected routes
const protectedRoutes = ['/liveMatches', '/matchStats/:matchId', '/matchStats'];

// Apply the checkJwt middleware to the protected routes
protectedRoutes.forEach(route => {
    app.all(route, checkJwt);
});

// Error handling middleware
app.use(function (err, req, res, next) {
    console.log(err);
    if (err instanceof UnauthorizedError && err.message === 'jwt expired') {
        return res.status(401).json({
            status: false,
            statusMessage: 'Token expired'
        });
    }
    next(err);
});

require(__basedir + 'app/route')(app);

app.use(function (req, res) {
    return res.status(404).json({
        status: false,
        statusMessage: '404 - Page not found'
    });
});

module.exports = app;