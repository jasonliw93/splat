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

        this.validators.title = function (value) {
            return (value && titleRegex.test(value)) ? 
                {isValid: true}: 
                {isValid: false, message: "Only 1 or more letters-digits-spaces allowed"};
        };
        //validator for release year
        this.validators.released = function (value) {
            return (value && yearRegex.test(value)) ? 
                {isValid: true}: 
                {isValid: false, message: "Only Year between 1910 - 2016"};
        };
        this.validators.director = this.validators.title;
        this.validators.rating = function (value) {
            return (value && ratingRegex.test(value)) ? 
                {isValid: true}: 
                {isValid: false, message: "Must contain 1 of G, PG, PG-13, R, NC-17, NR"};
        };

        this.validators.starring = function (values) {
            var index;
            for (index = 0; index < values.length; index++) {
                if (!values[index] || !actorRegex.test(values[index])){
                    return {isValid: false, message: "one-or-more comma-separated sequences of whitespace-separated words"};
                }
            }
            return {isValid: true}
        }
        this.validators.duration = function (value) {
            return (value && durationRegex.test(value)) ? 
                {isValid: true}: 
                {isValid: false, message: "0-999"};
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
        dated : undefined,  // date of movie posting
    },
    validateItem: function(key) {
        // if a validator is defined on this key
        // test it, else defaults to valid
        return (this.validators[key]) ? 
        this.validators[key](this.get(key)) 
        : {isValid: true};
    },
    validate: function (attrs) {
        var failed = []
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                var check = this.validateItem(key);
                if (!check.isValid){
                    splat.utils.addValidationError(key, check.message);
                    failed.push(key);
                }
            }
        }
        if (failed.length > 0){
            var message = "Please validate the fields";
            splat.utils.showNotice('Not Valid', message, 'alert-warning');
            return message
        }
    }
});