"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

splat.Movies = Backbone.Collection.extend({

    // identify collection's model
    model: splat.Movie,

    // save movie models under "splat" namespace,
    // since localStorage uses a flat namespace shared by all apps
    //localStorage: new Backbone.LocalStorage('splat')
    url: "/movies"

});