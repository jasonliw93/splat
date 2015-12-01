"use strict";

var fs = require('fs'),
    path = require("path"),
    // path is "../" since splat.js is in routes/ sub-dir
    config = require(__dirname + '/../config'),  // port#, other params
    express = require("express"),
    url = require("url"),
    _ = require("underscore"),
    bcrypt = require("bcrypt");

// create image-upload directory if it does not exist 
fs.exists(__dirname + '/../public/img/uploads', function (exists) {
    if (!exists) {
        fs.mkdir(__dirname + '/../public/img/uploads', function (err) {
            if (err) {
                process.exit(1);  // can this be cleaned up with throw error???
            };
        });
    }
});

// create video-upload directory if it does not exist 
fs.exists(__dirname + '/../public/img/videos', function (exists) {
    if (!exists) {
        fs.mkdir(__dirname + '/../public/img/videos', function (err) {
            if (err) {
                process.exit(1);  // can this be cleaned up with throw error???
            };
        });
    }
});

var mongoose = require('mongoose'); // MongoDB integration

// Connect to database, using credentials specified in your config module
mongoose.connect('mongodb://' +config.dbuser+ ':' +config.dbpass+
               '@' + config.dbhost + '/' + config.dbname);

// Schemas
var MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    released: { type: String, required: true},
    director: { type: String, required: true },
    starring: { type: [String], required: true },
    rating: { type: String, required: true },
    duration: { type: Number, required: true },
    genre: { type: [String], required: true },
    synopsis: { type: String, required: true },
    freshTotal: { type: Number, required: true },
    freshVotes: { type: Number, required: true },
    trailer: { type: String, required: false },
    poster: { type: String, required: true },
    dated: { type: Date, required: true},
    userId: {type:mongoose.Schema.Types.ObjectId, required: true},
});

var UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true }
});

var ReviewSchema = new mongoose.Schema({
    freshness: { type:Number, required: true},
    reviewText: { type:String, required: true},
    reviewName: { type:String, required: true},
    reviewAffil: { type:String, required: true},
    movieId: {type:mongoose.Schema.Types.ObjectId, required: true},
})

// Constraints

// each Movie title:director pair must be unique; duplicates are dropped
MovieSchema.index({"title":1, "director":1}, {unique: true, dropDups: true});

// each Review name:affil pair must be unique for a given movie (i.e.
// reviewers are allowed only one review per movie); duplicates are dropped
ReviewSchema.index({"reviewName":1, "reviewAffil":1, "movieId":1},
                   {unique: true, dropDups: true});

// Models
var Movie = mongoose.model('Movie', MovieSchema);
var User = mongoose.model('User', UserSchema);
var Review = mongoose.model('Review', ReviewSchema);

// Implemention of splat API handlers:

// "exports" is used to make the associated name visible
// to modules that "require" this file (in particular app.js)

// heartbeat response for server API
exports.api = function(req, res) {
    res.send(200, '<h3>Splat! 0.2 API is running!</h3><a href="index.html">Splat</a>');
};

// retrieve an individual movie model, using it's id as a DB key
exports.getMovie = function(req, res){
    // retrieve a specific movie
    Movie.findById(req.params.id, function(err, movie) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movie at this time (" 
                +err.message+ ")" );
        } else if (!movie) {
            res.status(404).send("Sorry, that movie doesn't exist; try reselecting from Browse view");
        } else {
            res.status(200).send(movie);
        }
    });
};
// retrives all movie models in collection
exports.getMovies = function(req, res){
    Movie.find(function(err, movies) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movies at this time");
        } else {
            res.status(200).send(movies);
        }
    });
};

// helper function, not exported
function savePoster(movie, callback){
    var dataUrlRegex = /^data:image\/(.+);base64,(.*)$/;
    var match = movie.poster.match(dataUrlRegex);
    // if poster is dataURL, then save it to file and update poster field
    if (match){
        var ext = match[1];
        var data = match[2];
        var imageURL = 'img/uploads/' + movie.id + "." + ext;
        var newPath = __dirname + '/../public/' + imageURL;
        // write the data to file
        fs.writeFile(newPath, data, 'base64', function (err) {
            if (err) {
                return res.status(500).send("Sorry, error occured when uploading file");
            }else{
                // forces browser to reload the image if cached
                movie.poster = imageURL + '?' + new Date().valueOf();;
                if (callback){
                    callback();
                }
            }
        });
    } else {
        if (callback){
            callback();
        }
    }
}

// creates a new movie model
exports.addMovie = function(req, res){    
    var movie = new Movie(req.body);
    movie.userId = req.session.userid;
    savePoster(movie, function() {
        movie.save(function (err, result) {
            if (!err) {
                res.status(200).send(movie);
                broadcastEvent({model: "movie", movieId: movie.id, action: 'add'});
            } else if (err.err && err.err.indexOf("E11000") > -1) {
                 res.status(403).send("Sorry, movie " +movie.title+ " directed by "
                        +movie.director+ " has already been created");
            } else {
                res.status(500).send('Unable to save movie at this time: '
                + 'please try again later ' + err.message);
            }
        });
    });
};

// edits movie model if the model can be found
exports.editMovie = function(req, res){
    Movie.findById(req.params.id, function(findErr, movie){ 
        if (findErr) {
            res.status(500).send('Server is unable to process movie update; '
                + 'please try again later ' + findErr.message);
        } else if (!movie) {
            res.status(404).send('Sorry, this movie does not exist (perhaps deleted?)');
        } else {
            // merge request fields with existing movie fields
            _.extend(movie, req.body);
            savePoster(movie, function() {
                movie.save(function (saveErr, result) {
                    if (!saveErr) {
                        res.status(200).send(movie);
                        broadcastEvent({model: "movie", movieId: movie.id, action: 'edit'});
                    } else if (saveErr.err && saveErr.err.indexOf("E11000") !== -1) {
                        res.status(403).send("Sorry, movie " +req.body.title
                            + " directed by " +req.body.director+ " already exists.");
                    } else if (saveErr.message) {
                        res.status(500).send('Movie update failed: ' + saveErr.message);
                    } else {
                        res.status(500).send('Movie update failed');
                    }
                });                     
            });
        }
    });
};

// deletes the movie if it exists
exports.deleteMovie = function(req, res){
    Movie.findByIdAndRemove(req.params.id, function(err, movie) {
        if (err) {
            res.status(500).send("Sorry, unable to delete movie at this time (" 
                +err.message+ ")" );
        } else if (!movie) {
            res.status(404).send("Sorry, that movie doesn't exist; try reselecting from Browse view");
        } else {
            fs.unlink(__dirname + '/../public/img/uploads/' + movie.id + '.jpeg', function (uerr) {
                if (uerr) {
                    console.log('poster image not deleted : ' + movie.id + '. ' + uerr);
                }else{
                    console.log('poster image deleted : ' + movie.id);
                }
            });
            fs.unlink(__dirname + '/../public/videos/' + movie.id + '.mp4', function (uerr){
                if (uerr) console.log(uerr);
            });
            Review.remove({movieId : movie.id}, function(err) {
                if (uerr) console.log(uerr);
            });
            broadcastEvent({model: "movie", movieId: movie.id, action: "remove"});
        }
    });
};

// adds a review model to the collection 
// and update corresponding movie freshvotes and freshtotals
exports.addReview = function(req, res){    
    // creates a new review model
    var review = new Review(req.body);
    review.movieId = req.params.id;
    // saves the review
    review.save(function (err, review) {
         if (err){
            res.status(500).send("Sorry, unable to add review at this time (" 
                        +err.message+ ")" );
        }else{
            Movie.findById(req.params.id, function(err, movie){ 
                if (err) {
                    res.status(500).send("Sorry, unable to retrieve movie at this time (" 
                        +err.message+ ")" );
                } else if (!movie) {
                    res.status(404).send("Sorry, the movie doesn't exist; try reselecting from Browse view");
                } else {
                    // update movie model if review save succesful
                    movie.freshVotes += review.freshness;
                    movie.freshTotal += 1;
                    movie.save(function (err, movie) {
                         if (err){
                            res.status(500).send("Sorry, unable to update movie at this time (" 
                                        +err.message+ ")" );
                        }else{
                            res.status(200).send(review);
                            broadcastEvent({model: "review", movieId: req.params.id, action: "add"});
                        }
                    });
                }
            });
        }
    });
    
};

// retrieves the movie reviews for a specific movie id
exports.getReviews = function(req, res){
    Review.find({movieId : req.params.id}, function(err, reviews) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve reviews at this time");
        } else {
            res.status(200).send(reviews);
        }
    });
};

// handles video upload to the server following multer middleware
exports.uploadVideo = function(req, res) {
    // req.files is an object, attribute "file" is the HTML-input name attr
    var filePath = req.files.video.path,  // ADD CODE to get file path
        fileType = req.files.video.mimetype,  // ADD CODE to get MIME type
        // extract the MIME suffix for the user-selected file
        suffix = '.' + fileType.split('/')[1],// ADD CODE
        // imageURL is used as the value of a movie-model poster field 
        // id parameter is the movie's "id" attribute as a string value
        videoURL = '/movies/' + req.params.id + '/video',
        // rename the image file to match the imageURL
        newPath = __dirname + '/../public/img/videos/' + req.params.id + suffix;
        fs.rename(filePath, newPath, function(err) {
        if (!err) {
            res.status(200).send(videoURL);
        } else {
            res.status(500).send("Sorry, unable to upload poster image at this time (" 
                +err.message+ ")" );
       }
    });
};

// handles video playback of trailer video on server
exports.playMovie = function(req, res){
    //console.log(req.headers);
    var file = path.resolve(__dirname,"../public/img/videos/" + req.params.id + ".mp4");
    var range = req.headers.range;
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);
    fs.stat(file, function (err, stats) {
        //console.log(stats);
        if (err) {
            res.status(404).send("Sorry, unable to retrieve video at this time");
        }else{
            var total = stats.size;
            var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
            var chunksize = (end - start) + 1;
            res.statusCode = 206;
            res.setHeader('Content-Range', 'bytes ' + start + '-' + end + '/' + total);
            res.setHeader('Content-Length', chunksize);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Type', 'video/mp4');
            var stream = fs.createReadStream(file, { start: start, end: end })
            .on("open", function() {
              stream.pipe(res);
            }).on("error", function(err) {
              res.end(err);
            });
        }
    });
};

exports.hasPermission = function(req, res, next) {
    Movie.findById(req.params.id, function(err, movie) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movie at this time (" 
                +err.message+ ")" );
        } else if (!movie) {
            res.status(404).send("Sorry, that movie doesn't exist; try reselecting from Browse view");
        } else {
            if (movie.userId == req.session.userid || !movie.userId){
                next();
            }else{
                res.status(403).send('You do not have permission to make changes to this item.');
            }
        }
    });
};

exports.isAuth = function (req, res) {
    console.log('isAuth ', req.session);
    if (req.session && req.session.auth) {
            res.send(200, {'userid': req.session.userid,
                'username': req.session.username});
    } else {
            res.status(200).send({'userid': '', 'username': ''});
    };
};

exports.auth = function (req, res) {
  if (req.body.login) {   // login request
    var username = req.body.username;
    var password = req.body.password;
    if (!username || !password) {
        res.status(403).send('Invalid username-password combination, please try again');
    };
    User.findOne({username:username}, function(err, user){
        if (user !== null) {
            /* A3 ADD CODE BLOCK ... */
            var sess = req.session;  // create session
            sess.auth = true;
            sess.username = username;
            sess.userid = user.id;
            // set session-timeout, from config file
            if (req.body.remember) {
                // if "remember me" selected on signin form,
                // extend session to 10*default-session-timeout
                // A3 ADD CODE BLOCK
                sess.cookie.maxAge = config.sessionTimeout * 10;
            }
            bcrypt.compare(password, user.password, function(err, match) {
                if (match){
                    res.status(200).send({'userid': user.id, 'username': username});
                }else{
                    res.status(403).send('Invalid username-password combination, please try again');
                }
            });
            // A3 ADD CODE BLOCK
        } else if (!err) {  // unrecognized username, but not DB error
            res.status(403).send('Invalid username-password combination, please try again');
        } else {  // error response from DB
            res.status(500).send("Unable to login at this time; please try again later " 
                + err.message);
        }
    });
  } else { // logout request
    //req.session.destroy(); // destroy session in the session-store
    var sess = req.session;  // create session
    sess.auth = false;
    sess.username = undefined;
    sess.userid = undefined;
    res.status(200).send({'userid': undefined, 'username': undefined});
  };
};

exports.signup = function(req, res) {
    var user = new User(req.body);
    encryptPassword(user, function() {
    // store the hashed-with-salt password in the DB
        user.save(function (serr, result) {
        if (!serr) {
          req.session.auth = true;
          req.session.username = result.username;
          req.session.userid = result.id;
          res.status(200).send({'username':result.username, 'userid':result.id});
        } else {
          if (serr.err && serr.err.indexOf("E11000") !== -1) {
            res.status(403).send("Sorry, username '"+user.username+
                "' is already taken; please choose another username");
          } else {
            res.status(500).send("Unable to create account at this time; please try again later (" +serr.message+ ")");
          }
        }
        });
    });
};

function encryptPassword(user, callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            // Store hash in your password DB.
            user.password = hash;  // A3 ADD CODE
            if (callback) {
                callback();
            }
        });
    });
}

// Server Sent Events
var subscribers = []; // array of active subscribers

exports.subscribeEvents = function (req, res) {
    // set timeout as high as possible
    res.setTimeout(0);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write("\n");
    // push this res object to our global variable
    subscribers.push(res);
    // When the request is closed, e.g. the browser window
    // is closed. We search through the open connections
    // array and remove this connection.
    req.on("close", function() {
        var toRemove;
        for (var j =0 ; j < subscribers.length ; j++) {
            if (subscribers[j] == res) {
                toRemove =j;
                break;
            }
        }
        subscribers.splice(j,1);
    });
    
};

// Write data to each subscriber's stream
function broadcastEvent(data){
    subscribers.forEach(function(res) {
        res.write("id: " + new Date().valueOf() + "\n");
        res.write("data: " + JSON.stringify(data) + "\n\n");
    });
}
