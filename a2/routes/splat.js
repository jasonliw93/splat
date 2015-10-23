"use strict";

var fs = require('fs'),
    // path is "../" since splat.js is in routes/ sub-dir
    config = require(__dirname + '/../config'),  // port#, other params
    express = require("express"),
    url = require("url");

// Implemention of splat API handlers:

// "exports" is used to make the associated name visible
// to modules that "require" this file (in particular app.js)

// heartbeat response for server API
exports.api = function(req, res){
  res.status(200).sendfile('public/index.html');
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
    movieModel.find({}, function(err, movies) {
    if (err) throw err;
        // object of all the users
    res.status(200).send(movies);
    });
};
exports.addMovie = function(req, res){    

    var movie = new movieModel(req.body);
    console.log(movie);
    movie.save(function (err, movie) {
        res.status(200).send(movie);
    });
};
exports.editMovie = function(req, res){
    movieModel.findById(req.params.id, function(err, movie) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movie at this time (" 
                +err.message+ ")" );
        } else if (!movie) {
            res.status(404).send("Sorry, that movie doesn't exist; try reselecting from Browse view");
        } else {
            movie.update(req.body, function (err, status) {
                res.status(200).send(movie);
            });
        }
    });
};
exports.deleteMovie = function(req, res){
    movieModel.findById(req.params.id, function(err, movie) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movie at this time (" 
                +err.message+ ")" );
        } else if (!movie) {
            res.status(404).send("Sorry, that movie doesn't exist; try reselecting from Browse view");
        } else {
            movie.remove(function (err, status) {
                res.status(200).send(movie);
            });
        }
    });
};

// upload an image file; returns image file-path on server
/*
{ fieldname: 'image',
  originalname: 'blob',
  encoding: '7bit',
  mimetype: 'image/png',
  destination: '/home/jason/cscc09/c09/a2/public/img/uploads/',
  filename: '44a7af63b2ffd0173d4d2868ce6d41d0',
  path: '/home/jason/cscc09/c09/a2/public/img/uploads/44a7af63b2ffd0173d4d2868ce6d41d0',
  size: 85974 }
*/
exports.uploadImage = function(req, res) {
    // req.files is an object, attribute "file" is the HTML-input name attr
    var filePath = req.file.path,  // ADD CODE to get file path
        fileType = req.file.mimetype,  // ADD CODE to get MIME type
        // extract the MIME suffix for the user-selected file
        suffix = '.' + fileType.split('/')[1],// ADD CODE
        // imageURL is used as the value of a movie-model poster field 
        // id parameter is the movie's "id" attribute as a string value
        imageURL = 'img/uploads/' + req.file.filename + suffix,
        // rename the image file to match the imageURL
        newPath = __dirname + '/../public/' + imageURL;
        fs.rename(filePath, newPath, function(err) {
        if (!err) {
            res.status(200).send(imageURL);
        } else {
            res.status(500).send("Sorry, unable to upload poster image at this time (" 
                +err.message+ ")" );
	}
    });
};

var mongoose = require('mongoose'); // MongoDB integration

// Connect to database, using credentials specified in your config module
//mongoose.connect('mongodb://' +config.dbuser+ ':' +config.dbpass+
//               '@10.15.2.164/' + config.dbname);
mongoose.connect('mongodb://localhost:27017/splat')
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

// Models
var movieModel = mongoose.model('Movie', MovieSchema);