// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Home) matches name of template file Home.html
splat.ReviewThumbs = Backbone.View.extend({
    // render the View
    initialize: function(options) {
        this.movieId = options.movieId;
    },
    moviesTemplate: _.template([
        "<% reviews.forEach(function(review) { %>",
        "<%= reviewTemplate(review.toJSON()) %>",
        "<% }); %>",
    ].join('')),
    // render View
    render: function() {
        var self = this;
        self.$el.html(self.moviesTemplate({
            reviews: self.collection,
            reviewTemplate: self.template
        }));
        return this; // support method chaining
    }

});