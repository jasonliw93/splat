"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

splat.Movie = Backbone.Model.extend({
    idAttribute: "_id",
    defaults: {
        title: "", // movie title    
        released: "", // release year
        director: "", // movie's director
        rating: "", // MPAA movie rating: G, PG, PG-13, R, NC-17, NR
        starring: [], // array principal actors
        duration: undefined, // run-time in minutes
        genre: [], // genre terms, e.g. action, comedy, etc
        synopsis: "", // brief outline of the movie
        freshTotal: 0.0, // cumulative total of review fresh (1.0) votes
        freshVotes: 0.0, // number of review ratings
        trailer: "", // URL for trailer/movie-streaming
        poster: "img/placeholder.png", // movie-poster image URL
        dated: new Date(), // date of movie posting
    },
    validators: {
        title : function(value) {
            var titleRegex = /^[a-zA-Z0-9 \,\.\?\-\'\*]+$/;
            return (value && titleRegex.test(value)) ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter a movie title. Only letters-digits-spaces and \",\", \".\", \"!\", \"?\", \"-\", \"'\", \"*\" allowed"
            };
        },
        released : function(value) {
            var yearRegex = /^(19[1-9]\d|20[0-1][0-6])$/ //1910-2016
            return (value && yearRegex.test(value)) ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter a year between 1910 and 2016"
            };
        },
        director : function(value) {
            var directorRegex = /^[a-zA-Z0-9 \,\.\?\-\'\*]+$/;
            return (value && directorRegex.test(value)) ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter a director's name. Only letters-digits-spaces and \",\", \".\", \"!\", \"?\", \"-\", \"'\", \"*\" allowed"
            };
        },
        rating : function(value) {
            var ratingRegex = /^(G|PG|PG\-13|R|NC\-17|NR)$/;
            return (value && ratingRegex.test(value)) ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter one of G, PG, PG-13, R, NC-17, NR."
            };
        },
        starring : function(values) {
            var actorRegex = /^[a-zA-Z \-\']+$/;
            var notValid = {
                isValid: false,
                message: "You must enter atleast one actor's name. Only letters-spaces and \"-\", \"'\""
            };
            if (!(values instanceof Array) || values.length == 0) {
                return notValid;
            }
            for (var index = 0; index < values.length; index++) {
                if (!values[index] || !actorRegex.test(values[index])) {
                    return notValid;
                }
            }
            return {
                isValid: true
            }
        },
        duration : function(value) {
            var durationRegex = /^(\d\d?\d?)$/;
            return (value && durationRegex.test(value)) ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter a duration between 0 and 999."
            };
        },
        genre : function(values) {
            var genreRegex = /^[a-zA-Z \-\']+$/;
            var notValid = {
                isValid: false,
                message: "You must enter atleast one movie genre. Only letters-spaces and \"-\", \"'\""
            };
            if (!(values instanceof Array) || values.length == 0) {
                return notValid;
            }
            for (var index = 0; index < values.length; index++) {
                if (!values[index] || !genreRegex.test(values[index])) {
                    return notValid;
                }
            }
            return {
                isValid: true
            }
        },
        synopsis : function(value) {
            var wordRegex = /^[ \w\d\,\.\?\-\'\*]+$/;
            var notValid = {
                isValid: false,
                message: "You must enter a synopsis. Only letters-digits-spaces and \",\", \".\", \"!\", \"?\", \"-\", \"'\", \"*\" allowed."
            };
            var lines = value.split('\n')
            for (var index = 0; index < lines.length; index++) {
                if (!wordRegex.test(lines[index])) {
                    return notValid;
                }
            }
            return {
                isValid: true
            }
        },
        trailer : function(value) {
            var urlRegex = /^(https?:\/\/[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?)$/;
            return (!value || urlRegex.test(value)) ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter a valid trailer url"
            };
        },
        dated : function(value) {
            var d = new Date(value);
            return (value && d instanceof Date && !isNaN(d)) ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter a valid dated date"
            };
        }
    },
    validateItem: function(key) {
        // if a validator is defined on this key
        // test it, else defaults to valid
        return (this.validators[key]) ?
            this.validators[key](this.get(key)) : {
                isValid: true
            };
    },
    validate: function(attrs) {
        this.invalid = {};
        var isInvalid = false;
        for (var key in attrs) {
            if (this.validators[key]){
                var check = this.validators[key](attrs[key])
                if (!check.isValid){
                    this.invalid[key] = check.message;
                    isInvalid = true
                }
            }
        }
        if (isInvalid) {
            return "Fix validation errors and try again";
        }
    }
});