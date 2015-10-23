"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

splat.Reviews = Backbone.Collection.extend({

    // identify collection's model
    model: splat.Review,

    // save movie models under "splat" namespace,
    // since localStorage uses a flat namespace shared by all apps
    localStorage: new Backbone.LocalStorage('reviews')
    //url: "/reviews"

});