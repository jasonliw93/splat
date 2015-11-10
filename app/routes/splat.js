"use strict";

var fs = require('fs'),
    path = require("path"),
    // path is "../" since splat.js is in routes/ sub-dir
    config = require(__dirname + '/../config'),  // port#, other params
    express = require("express"),
    url = require("url"),
    _ = require("underscore");
// Implemention of splat API handlers:

// "exports" is used to make the associated name visible
// to modules that "require" this file (in particular app.js)

// heartbeat response for server API
exports.api = function(req, res){
  res.status(200).send('<h3>Eatz API is running!</h3>');
};

// retrieve an individual movie model, using it's id as a DB key
exports.getMovie = function(req, res){
    movieModel.findById(req.params.id, function(err, movie) {
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
exports.getMovies = function(req, res){
    movieModel.find(function(err, movies) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movies at this time");
        } else {
            res.status(200).send(movies);
        }
    });
};

exports.addMovie = function(req, res){    
    var movie = new movieModel(req.body);
    saveMovie(movie, res, 'add');
};

exports.editMovie = function(req, res){
    movieModel.findById(req.params.id, function(err, movie){ 
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movie at this time (" 
                +err.message+ ")" );
        } else if (!movie) {
            res.status(404).send("Sorry, that movie doesn't exist; try reselecting from Browse view");
        } else {
            _.extend(movie, req.body);
            saveMovie(movie, res, 'update');
        }
    });
};

// Helper function used to save the movie which 
// checks if poster needs to be saved to file first
// and send response to original request.
function saveMovie(movie, res, action){    
    // save function called after we check if we have to save poster to file
    var save = function() {
        movie.save(function (err, movie) {
            if (err){
                res.status(500).send("Sorry, unable to " + action + " movie at this time (" 
                            +err.message+ ")" );
            }else{
                res.status(200).send(movie);
                broadcastEvent({model: "movie", movieId: movie.id, action: action});
            }
        });
    };
    var regex = /^data:image\/(.+);base64,(.*)$/;
    var match = movie.poster.match(regex);
    if (match){
        var ext = match[1];
        var data = match[2];
        var buffer = new Buffer(data, 'base64');
        var imageURL = 'img/uploads/' + movie.id + "." + ext;
        var newPath = __dirname + '/../public/' + imageURL;
        // write the data to file
        fs.writeFile(newPath, buffer, function (err) {
            if (err) 
                return res.status(500).send("Sorry, error occured when uploading file");
            // forces browser to reload the image if cached
            movie.poster = imageURL + '?' + new Date().valueOf();;
            save();
        });
    }else{
        save();
    }
}

exports.deleteMovie = function(req, res){
    movieModel.findByIdAndRemove(req.params.id, function(err, movie) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movie at this time (" 
                +err.message+ ")" );
        } else if (!movie) {
            res.status(404).send("Sorry, that movie doesn't exist; try reselecting from Browse view");
        } else {
            fs.unlink(__dirname + '/../public/img/uploads/' + movie.id + '.jpeg');
            res.status(200).send(movie);
            broadcastEvent({model: "movie", movieId: movie.id, action: "remove"});
        }
    });
};

exports.addReview = function(req, res){    
    var review = new reviewModel(req.body);
    review.movieId = req.params.id;
    review.save(function (err, review) {
         if (err){
            res.status(500).send("Sorry, unable to add review at this time (" 
                        +err.message+ ")" );
        }else{
            movieModel.findById(req.params.id, function(err, movie){ 
                if (err) {
                    res.status(500).send("Sorry, unable to retrieve movie at this time (" 
                        +err.message+ ")" );
                } else if (!movie) {
                    res.status(404).send("Sorry, the movie doesn't exist; try reselecting from Browse view");
                } else {
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

exports.getReviews = function(req, res){
    reviewModel.find({movieId : req.params.id}, function(err, reviews) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve reviews at this time");
        } else {
            res.status(200).send(reviews);
        }
    });
};
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
        newPath = __dirname + '/../public/videos/' + req.params.id + suffix
        fs.rename(filePath, newPath, function(err) {
        if (!err) {
            res.status(200).send(videoURL);
        } else {
            res.status(500).send("Sorry, unable to upload poster image at this time (" 
                +err.message+ ")" );
       }
    });
};
exports.playMovie = function(req, res){
    var file = path.resolve(__dirname,"../public/videos/" + req.params.id + ".mp4");
    //console.log(file);
    var range = req.headers.range;
    //console.log(range);
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
    // ADD CODE for other Movie attributes
});

var ReviewSchema = new mongoose.Schema({
    freshness: { type:Number, required: true},
    reviewText: { type:String, required: true},
    reviewName: { type:String, required: true},
    reviewAffil: { type:String, required: true},
    movieId: {type:String, required: true},
})

// Constraints
// each title:director pair must be unique; duplicates are dropped
MovieSchema.index({ title: 1, director: 1 }, { unique: true });  // ADD CODE

// Models
var movieModel = mongoose.model('Movie', MovieSchema);
var reviewModel = mongoose.model('Review', ReviewSchema);

// Server Sent Events
var subscribers = [];

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

function broadcastEvent(data){
    subscribers.forEach(function(res) {
        res.write("id: " + new Date().valueOf() + "\n");
        res.write("data: " + JSON.stringify(data) + "\n\n");
    });
}