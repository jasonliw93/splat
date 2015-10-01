"use strict";

// declare splat-app namespace if it doesn't already exist
var splat =  splat || {};

splat.Movie = Backbone.Model.extend({
    
    idAttribute: "_id", 
    defaults: {
        title : "",  // movie title    
        released : "",  // release year
        director: "", // movie's director
        rating : "",  // MPAA movie rating: G, PG, PG-13, R, NC-17, NR
        starring : [],  // array principal actors
        duration : undefined,   // run-time in minutes
        genre : [],   // genre terms, e.g. action, comedy, etc
        synopsis : "",  // brief outline of the movie
        freshTotal : 0.0,   // cumulative total of review fresh (1.0) votes
        freshVotes : 0.0,   // number of review ratings
        trailer : "",  // URL for trailer/movie-streaming
        poster : "img/placeholder.png",  // movie-poster image URL
        dated : undefined,  // date of movie posting
    }
});