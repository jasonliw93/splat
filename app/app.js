// app.js Node.js server

"use strict;"   // flag JS errors 

/* Module dependencies:
 *
 * require() loads a nodejs "module" - basically a file.  Anything
 * exported from that file (with "exports") can now be dotted off
 * the value returned by require(), in this case e.g. splat.api
 * The convention is use the same name for variable and module.
 */

var https = require('https'),   // ADD CODE
    // NOTE, use the version of "express" linked to the assignment handout
    express = require('express'),   // ADD CODE
    fs = require("fs"),
    path = require("path"),
    url = require("url"),
    multer = require("multer"),
    logger = require("morgan"),
    compression = require("compression"),
    session = require("express-session"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    directory = require("serve-index"),
    errorHandler = require("errorhandler"),
    basicAuth = require("basic-auth-connect"),  // optional, for HTTP auth
    csrf = require('csurf'),
    // config is an object module, that defines app-config attribues,
    // such as "port", DB parameters
    config = require("./config"),
    splat = require('./routes/splat.js');  // route handlers ... ADD CODE

var app = express();  // Create Express app server

app.use(session({
  secret: 'My super session secret',
  cookie: {
    httpOnly: true,
    secure: true
  }
}));

app.use(csrf());

// Setup for rendering csurf token into index.html at app-startup
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/public');
// When client-side requests index.html, perform template substitution on it
app.get('/index.html', function(req, res) {
    // req.csrfToken() returns a fresh random CSRF token value
    res.render('index.html', {csrftoken: req.csrfToken()});
});

// Configure app server

// use PORT environment variable, or local config file value
app.set('port', process.env.PORT || config.port);

// activate basic HTTP authentication (to protect your solution files)
if (config.httpauth){
    app.use(basicAuth(config.username, config.password));
}
// change param value to control level of logging  ... ADD CODE
app.use(logger('dev'));  // 'default', 'short', 'tiny', 'dev'

// placed before compression otherwise it will not work
app.get('/events', splat.subscribeEvents);

// use compression (gzip) to reduce size of HTTP responses
app.use(compression());

// parse HTTP request body
app.use(bodyParser.json({
    limit: 100000
}));
app.use(bodyParser.urlencoded({
    extended: true
}));

// set file-upload directory for trailer videos
var movieMulter = multer({
    dest: __dirname + '/public/videos/uploads/',
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024
    },
});
var imageMulter = multer({dest: __dirname + '/public/img/uploads/'});
// checks req.body for HTTP method overrides
app.use(methodOverride());

// App routes (RESTful API) - handler implementation resides in routes/splat.js

// Perform route lookup based on HTTP method and URL.
// Explicit routes go before express.static so that proper
// handler is invoked rather than static-content processor

// Heartbeat test of server API
app.get('/', splat.api);

// route handlers for movie model
app.get('/movies/:id', splat.getMovie);
app.get('/movies', splat.getMovies);
app.post('/movies', splat.addMovie);
app.put('/movies/:id', splat.editMovie);
app.delete('/movies/:id', splat.deleteMovie);

// route handlers for review model
app.get('/movies/:id/reviews', splat.getReviews);
app.post('/movies/:id/reviews', splat.addReview);

// route handlers for video upload and playback
app.get('/movies/:id/video', splat.playMovie);
app.post('/movies/:id/video', movieMulter, splat.uploadVideo);

// location of app's static content
app.use(express.static(__dirname + "/public"));

// return error details to client - use only during development
app.use(errorHandler({ dumpExceptions:true, showStack:true }));

// log and close anything else
app.use(function (req, res) {
    console.log('%s %s', req.method, req.url);
    res.status(404).end();
});

var options = {
    key: fs.readFileSync('key.pem'),  // RSA private-key
    cert: fs.readFileSync('cert.pem')  // RSA public-key certificate
};

// Start HTTP server
https.createServer(options, app).listen(app.get('port'), function () {
    console.log("Express server listening on port %d in %s mode",
            app.get('port'), config.env );
});
