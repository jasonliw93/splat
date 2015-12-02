"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

splat.Movie = Backbone.Model.extend({
    idAttribute: "_id",
    // default values for each attribute
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
        dated: new Date(), // date of movie created
        userId: undefined,
    },
    // validators for each attribute
    validators: {
        title : function(value) {
            // regex for movie title
            var titleRegex = /^[a-zA-Z0-9 \,\.\!\?\-\'\*]+$/;
            //checks if title is valid
            return (value && titleRegex.test(value)) ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter a movie title. Only letters-digits-spaces and \",\", \".\", \"!\", \"?\", \"-\", \"'\", \"*\" allowed"
            };
        },
        released : function(value) {
            // regex for movie year
            var yearRegex = /^(19[1-9]\d|20(1[0-6]|0\d))$/; //1910-2016
            //checks if year is valid
            return (value && yearRegex.test(value)) ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter a year between 1910 and 2016"
            };
        },
        director : function(value) {
            // regex for director
            var directorRegex = /^[a-zA-Z0-9 \,\.\!\?\-\'\*]+$/;
            // checks if director input is valid
            return (value && directorRegex.test(value)) ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter a director's name. Only letters-digits-spaces and \",\", \".\", \"!\", \"?\", \"-\", \"'\", \"*\" allowed"
            };
        },
        rating : function(value) {
            // regex for movie rating
            var ratingRegex = /^(G|PG|PG\-13|R|NC\-17|NR)$/;
            // checks if rating is valid
            return (value && ratingRegex.test(value)) ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter one of G, PG, PG-13, R, NC-17, NR."
            };
        },
        starring : function(values) {
            // regex for actor names
            var actorRegex = /^[a-zA-Z \-\']+$/;
            var notValid = {
                isValid: false,
                message: "You must enter atleast one actor's name. Only letters-spaces and \"-\", \"'\""
            };
            // checks if starring is an array and there is atleast one actor
            if (!(values instanceof Array) || values.length === 0) {
                return notValid;
            }
            // checks if there is an actor that is invalid in the array
            for (var index = 0; index < values.length; index++) {
                if (!values[index] || !actorRegex.test(values[index])) {
                    return notValid;
                }
            }
            return {
                isValid: true
            };
        },
        duration : function(value) {
            // checks if the duration is a number
            return (!isNaN(value) && value >= 0 && value <= 999) ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter a duration between 0 and 999."
            };
        },
        genre : function(values) {
            // regex for genre
            var genreRegex = /^[a-zA-Z \-\']+$/;
            var notValid = {
                isValid: false,
                message: "You must enter atleast one movie genre. Only letters-spaces and \"-\", \"'\""
            };
            // checks if genre is an array and there is atleast one genre
            if (!(values instanceof Array) || values.length === 0) {
                return notValid;
            }
            // checks if there is an invalid genre in the array
            for (var index = 0; index < values.length; index++) {
                if (!values[index] || !genreRegex.test(values[index])) {
                    return notValid;
                }
            }
            return {
                isValid: true
            };
        },
        synopsis : function(value) {
            // regex for synopsis
            var wordRegex = /^[ \w\,\.\!\?\-\'\*]+$/;
            var notValid = {
                isValid: false,
                message: "You must enter a synopsis. Only letters-digits-spaces and \",\", \".\", \"!\", \"?\", \"-\", \"'\", \"*\" allowed. No blank lines."
            };
            var lines = value.split('\n');
            // checks if its empty or only filled with symbols
            for (var index = 0; index < lines.length; index++) {
                if (!wordRegex.test(lines[index])) {
                    return notValid;
                }
            }
            return {
                isValid: true
            };
        },
        freshTotal : function(value) {
            // checks if freshtotal is a number
            return (!isNaN(value) && value >= 0)  ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter non-negative integer."
            };
        },
        freshVotes : function(value) {
            // checks if freshvotes is a number
            return (!isNaN(value) && value >= 0)  ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter non-negative integer."
            };
        },
        trailer : function(value) {
            // regex for trailer URL
            var urlRegex = /^(https?:\/\/[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?)$/;
            //var urlRegex = /^(https?:\/\/\w+(\.\w+)*(\/[\w\.#]+)*\/?)?$/;
            return (!value || urlRegex.test(value)) ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter a valid trailer url"
            };
        },
        dated : function(value) {
            // convert to date object if dated is a date string
            var d = new Date(value); 
            // checks if dated is valid (valid dates have number value)
            return (value && d instanceof Date && !isNaN(d)) ? {
                isValid: true
            } : {
                isValid: false,
                message: "You must enter a valid dated date"
            };
        }
    },
    // validate a single model field given by key
    validateItem: function(key) {
        // if a validator is defined on this key
        // test it, else defaults to valid
        return (this.validators[key]) ?
            this.validators[key](this.get(key)) : {
                isValid: true
            };
    },
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if (this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages}
                    : {isValid: true};

    }
});