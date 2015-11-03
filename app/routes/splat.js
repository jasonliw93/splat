"use strict";

var fs = require('fs'),
    // path is "../" since splat.js is in routes/ sub-dir
    config = require(__dirname + '/../config'),  // port#, other params
    express = require("express"),
    url = require("url"),
    app = require(__dirname + '/../app');
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
    movie.save(function (err, movie) {
        res.status(200).send(movie);
        if (movie.poster.indexOf('upload.png') > 0){
            writeStream({model: "movie", movieId: movie.id, action: "upload image"});
        }else{
            writeStream({model: "movie", movieId: movie.id, action: "add"});
        }

    });
};
exports.editMovie = function(req, res){
    delete req.body._id;
    movieModel.findByIdAndUpdate(req.params.id, req.body, function(err, movie){ 
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movie at this time (" 
                +err.message+ ")" );
        } else if (!movie) {
            res.status(404).send("Sorry, that movie doesn't exist; try reselecting from Browse view");
        } else {
            res.status(200).send(movie);
            if (req.body.poster.indexOf('upload.png') > 0){
                writeStream({model: "movie", movieId: movie.id, action: "upload image"});
            }else{
                writeStream({model: "movie", movieId: movie.id, action: "update"});
            }
        }
    });
};
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
            writeStream({model: "movie", movieId: movie.id, action: "remove"});
        }
    });
};

exports.uploadImage = function(req, res) {
    // req.files is an object, attribute "file" is the HTML-input name attr
    var filePath = req.files.image.path,  // ADD CODE to get file path
        fileType = req.files.image.mimetype,  // ADD CODE to get MIME type
        // extract the MIME suffix for the user-selected file
        suffix = '.' + fileType.split('/')[1],// ADD CODE
        // imageURL is used as the value of a movie-model poster field 
        // id parameter is the movie's "id" attribute as a string value
        imageURL = 'img/uploads/' + req.params.id + suffix,
        // rename the image file to match the imageURL
        newPath = __dirname + '/../public/' + imageURL,
        datedImageUrl = imageURL + '?' + new Date().valueOf();

        fs.rename(filePath, newPath, function(err) {
        if (!err) {
            movieModel.findByIdAndUpdate(req.params.id, {poster: datedImageUrl}, function(err, movie){ 
                if (err) {
                    res.status(500).send("Sorry, unable to retrieve movie at this time (" 
                        +err.message+ ")" );
                }else{
                    res.status(200).send(datedImageUrl);
                    writeStream({model: "movie", movieId: movie.id, action: "image success"});
                }
            });
        } else {
            res.status(500).send("Sorry, unable to upload poster image at this time (" 
                +err.message+ ")" );
	}
    });
};

exports.addReview = function(req, res){    
    var review = new reviewModel(req.body);
    review.movieId = req.params.id;
    review.save(function (err, review) {
        movieModel.findById(req.params.id, function(err, movie){ 
            if (err) {
                res.status(500).send("Sorry, unable to retrieve movie at this time (" 
                    +err.message+ ")" );
            } else if (!movie) {
                res.status(404).send("Sorry, that movie doesn't exist; try reselecting from Browse view");
            } else {
                movie.freshVotes += review.rating;
                movie.freshTotal += 1;
                movie.save(function (err, movie) {
                    res.status(200).send(review);
                });
                writeStream({model: "review", movieId: req.params.id, action: "add"});
            }
        });
    });
    
};

exports.getReviews = function(req, res){
    reviewModel.find({movieId : req.params.id}, function(err, reviews) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movies at this time");
        } else {
            res.status(200).send(reviews);
        }
    });
};
var mongoose = require('mongoose'); // MongoDB integration

// Connect to database, using credentials specified in your config module
mongoose.connect('mongodb://' +config.dbuser+ ':' +config.dbpass+
               '@' + config.dbhost + '/' + config.dbname);
//mongoose.connect('mongodb://localhost:27017/splat')
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

// Constraints
// each title:director pair must be unique; duplicates are dropped
//MovieSchema.index(...);  // ADD CODE

var ReviewSchema = new mongoose.Schema({
    rating: { type:Number, required: true},
    reviewText: { type:String, required: true},
    reviewName: { type:String, required: true},
    reviewAffil: { type:String, required: true},
    movieId: {type:String, required: true},
})
// Models
var movieModel = mongoose.model('Movie', MovieSchema);
var reviewModel = mongoose.model('Review', ReviewSchema);
/*
reviewModel.remove({}, function(err) { 
   console.log('collection removed') 
});
*/
// MUST BE PLACED BEFORE compression otherwise it will not work

var openConnections = [];

exports.getStream = function (req, res) {
    // set timeout as high as possible
    req.socket.setTimeout(Number.MAX_SAFE_INTEGER || Infinity);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // push this res object to our global variable
    openConnections.push(res);
    // When the request is closed, e.g. the browser window
    // is closed. We search through the open connections
    // array and remove this connection.
    
    req.on("close", function() {
        var toRemove;
        for (var j =0 ; j < openConnections.length ; j++) {
            if (openConnections[j] == res) {
                toRemove =j;
                break;
            }
        }
        openConnections.splice(j,1);
    });
};

function writeStream(data){
    openConnections.forEach(function(res) {
        res.write("id: " + new Date().valueOf() + "\n");
        res.write("data: " + JSON.stringify(data) + "\n\n");
    });
}