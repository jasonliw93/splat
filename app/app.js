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

// middleware check that req is associated with an authenticated session
function isAuthd(req, res, next) {
    if (req.session && req.session.auth) {
        return next();
    }else{
        res.status(403).send('Please log in first, before making changes.');
    }
};

// middleware check that the session-userid matches the userid passed
// in the request body, e.g. when deleting or updating a model
    
function hasPermission(req, res, next) {
    // A3 ADD CODE BLOCK
    if (req.session && req.body.userId == req.session.userid) {
        return next();
    }else{
        res.status(403).send('You do not have permission to make changes to this item.');
    }

};

var app = express();  // Create Express app server

// Configure app server

// use PORT environment variable, or local config file value
app.set('port', process.env.PORT || config.port);

// activate basic HTTP authentication (to protect your solution files)
if (config.basicAuth){
    app.use(basicAuth(config.basicAuthUser, config.basicAuthPass));  
}
// change param value to control level of logging  ... ADD CODE
app.use(logger('dev'));  // 'default', 'short', 'tiny', 'dev'

// placed before compression otherwise it will not work
app.get('/events', splat.subscribeEvents);

// use compression (gzip) to reduce size of HTTP responses
app.use(compression());

// parse HTTP request body
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({
    extended: true, limit: '5mb'
}));

// set file-upload directory for trailer videos
var movieMulter = multer({
    dest: __dirname + '/public/img/videos/',
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024
    },
});
var imageMulter = multer({dest: __dirname + '/public/img/uploads/'});

app.use(session({
        name: 'splat.sess',
        secret: config.sessionSecret,  // A3 ADD CODE
        //store: store,
        rolling: true,  // reset session timer on every client access
        cookie: { 
            maxAge:config.sessionTimeout,  // A3 ADD CODE
            secure: true,
            httpOnly: true 
        },
        saveUninitialized: false,
        resave: false
}));

app.use(csrf());

// Setup for rendering csurf token into index.html at app-startup
app.engine('.html', require('ejs').__express);

app.set('views', __dirname + '/public');

// When client-side requests index.html, perform template substitution on it
app.get('/index.html', function(req, res) {
    // req.csrfToken() returns a fresh random CSRF token value
    console.log(req.session);
    res.render('index.html', {
        csrftoken: req.csrfToken()
    });
});

app.use(function(err, req, res, next) { 
    if (err.code == 'EBADCSRFTOKEN'){
        res.status(403).send('reload the app to get a fresh CSRF token value');
    }else{
        next();
    }
});

// checks req.body for HTTP method overrides
app.use(methodOverride());

// App routes (RESTful API) - handler implementation resides in routes/splat.js

// Perform route lookup based on HTTP method and URL.
// Explicit routes go before express.static so that proper
// handler is invoked rather than static-content processor

// Heartbeat test of server API
app.get('/', splat.api);

// Retrieve a single movie by its id attribute
app.get('/movies/:id', splat.getMovie);

// Retrieve a collection of all movies
app.get('/movies', splat.getMovies);

// Create a new movie in the collection
app.post('/movies', isAuthd, splat.addMovie);

// Update an existing movie in the collection
app.put('/movies/:id', [isAuthd, splat.hasPermission], splat.editMovie);

// Delete a movie from the collection
app.delete('/movies/:id', [isAuthd, splat.hasPermission], splat.deleteMovie);

// Retrieve a collection of reviews for movie with given id
app.get('/movies/:id/reviews', splat.getReviews);

// Create a new review in the collection
app.post('/movies/:id/reviews', isAuthd, splat.addReview);

// Video playback request
app.get('/movies/:id/video', splat.playMovie);

// Video upload request
app.post('/movies/:id/video', movieMulter, splat.uploadVideo);

// User login/logout
app.put('/user', splat.auth);

// User signup
app.post('/user', splat.signup);

// location of app's static content
app.use(express.static(__dirname + "/public"));

// allow browsing of docs directory
app.use(directory(__dirname +  "/public/docs"));

// return error details to client - use only during development
app.use(errorHandler({ dumpExceptions:true, showStack:true }));

// Default-route middleware in case none of above match
app.use(function (req, res) {
    res.status(404).send('<h3>File Not Found</h3>');
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
