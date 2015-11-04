"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

splat.Review = Backbone.Model.extend({
    idAttribute: "_id",
    // default values for each attribute
    defaults: {
        freshness : 0.0,
        reviewName : "",
        reviewAffil : "",
        reviewText : "",
        movieId : "",
    }
});	