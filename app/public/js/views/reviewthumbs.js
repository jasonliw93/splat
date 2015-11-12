// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

splat.ReviewThumbs = Backbone.View.extend({
    // render the View
    initialize: function(options) {
        this.reviewThumbView = new splat.ReviewThumb();
    },
    // creates the review thumbs template function
    reviewsTemplate: _.template([
        "<% reviews.each(function(review) { %>",
        "<%= reviewTemplate(review.toJSON()) %>",
        "<% }); %>",
    ].join('')),
    // render View
    render: function() {
        var self = this;
        self.$el.html(self.reviewsTemplate({
            reviews: self.collection,
            reviewTemplate: self.reviewThumbView.template
        }));
        return this; // support method chaining
    }

});