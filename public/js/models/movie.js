"use strict";

// declare splat-app namespace if it doesn't already exist
var splat =  splat || {};

splat.Movie = Backbone.Model.extend({
    initialize: function() {
        this.validators = {};
        //regex for input values
        var titleRegex = /^[a-zA-Z0-9 \,\.\?\-\'\*]+$/;
        var actorRegex = /^[a-zA-Z \-\']+$/;
        var yearRegex = /^(19[1-9]\d|20[0-1][0-6])$/ //1910-2016
        var ratingRegex = /^(G|PG|PG\-13|R|NC\-17|NR)$/;
        var durationRegex =  /^(\d\d?\d?)$/;
        var urlRegex = /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
        this.validators.title = function (value) {
            return (value && titleRegex.test(value)) ? 
                {isValid: true}: 
                {isValid: false, message: "Must consist of one or more letter and/or digit characters optionally with space characters and special characters."};
        };
        //validator for release year
        this.validators.released = function (value) {
            return (value && yearRegex.test(value)) ? 
                {isValid: true}: 
                {isValid: false, message: "Must be a 4-digit year in the range 1910-2016."};
        };
        this.validators.director = this.validators.title;
        this.validators.rating = function (value) {
            return (value && ratingRegex.test(value)) ? 
                {isValid: true}: 
                {isValid: false, message: "Must consist of one of G, PG, PG-13, R, NC-17, NR."};
        };

        this.validators.starring = function (values) {
            if (values.length == 0) {
                return {isValid: false, message: "Must consist of one-or-more comma-separated sequences of whitespace-separated words."};
            }
            for (var index = 0; index < values.length; index++) {
                if (!values[index] || !actorRegex.test(values[index])){
                    return {isValid: false, message: "Must consist of one-or-more comma-separated sequences of whitespace-separated words."};
                }
            }
            return {isValid: true}
        }
        this.validators.duration = function (value) {
            return (value && durationRegex.test(value)) ? 
                {isValid: true}: 
                {isValid: false, message: "Must consist of an integer in the range 0-999."};
        };
        this.validators.genre = this.validators.starring;
        this.validators.synopsis = function(value) {
            return actorRegex.test(value)? 
                {isValid: true}: 
                {isValid: false, message: "Must consist of a non-empty word list."};
        };
        this.validators.trailer = function (value) {
            return (value && urlRegex.test(value)) ? 
                {isValid: true}: 
                {isValid: false, message: "Must be either an empty string or a properly-formatted URL."};
        };
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
        dated : new Date(),  // date of movie posting
    },
    validateItem: function(key) {
        // if a validator is defined on this key
        // test it, else defaults to valid
        return (this.validators[key]) ? 
        this.validators[key](this.get(key)) 
        : {isValid: true};
    },
    validate: function (attrs) {
        this.invalid = {};
        for (var key in attrs) {
            var check = this.validateItem(key);
            if (!check.isValid){
                this.invalid[key] = check.message;
            }
        }
        if (Object.keys(this.invalid).length){
            return "Please validate the fields";
        }
    }
});