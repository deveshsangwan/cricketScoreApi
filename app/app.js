const app = require('express')();
const bodyParser = require('body-parser');
const httpContext = require('express-http-context');
const Mongo = require('./core/mongo');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(httpContext.middleware);

app.use((req, res, next) => {
    httpContext.set('req', req);
    next();
});

require(__basedir + 'app/route')(app);

app.use(function (req, res) {
    return res.status(404).json({
        status: false,
        statusMessage: '404 - Page not found'
    });
});

module.exports = app;