"use strict";

// declare splat-app namespace if it doesn't already exist
var splat =  splat || {};

splat.Movie = Backbone.Model.extend({
    initialize: function() {
        this.validators = {};
        var titleRegex = /^[a-zA-Z0-9 \,\.\?\-\'\*]+$/;
        var yearRegex = /^(189[6-9]|19\d\d|201\d)$/
        var ratingRegex = /^[a-zA-Z0-9 \,\.\?\-\'\*]+$/;
        this.validators.title = function (value) {
            return (value && titleRegex.test(value)) ? 
                {isValid: true}: 
                {isValid: false, message: "Only 1 or more letters-digits-spaces allowed"};
        };
        this.validators.released = function (value) {
            return (value && yearRegex.test(value)) ? 
                {isValid: true}: 
                {isValid: false, message: "Year between 1896 - 2019"};
        };
        this.validators.director = this.validators.title;
        this.validators.rating = this.validators.title;
        this.validators.starring = function (values) {
            for(v in values)
            {
                if (v && !titleRegex.test(v)){
                    return {isValid: false, message: "Only 1 or more letters-digits-spaces allowed"};          
                }
            }
            return {isValid: true}
        }
        this.validators.genre = this.validators.starring;
        this.validators.synopsis = this.validators.title;
    },
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
    },
    validateItem: function(key) {
        // if a validator is defined on this key
        // test it, else defaults to valid
        return (this.validators[key]) ? 
        this.validators[key](this.get(key)) 
        : {isValid: true};
    },
});