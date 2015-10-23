// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Home) matches name of template file Home.html
splat.ReviewThumbs = Backbone.View.extend({
    // render the View
    initialize: function() {
        this.reviewThumbLoad = $.get('tpl/ReviwerThumb.html');
        
    },
    // function to combine review JSON data for rendering to HTML
    reviewsTemplate: _.template([
        "<% reviews.each(function(review) { %>",
        "<%= reviewTemplate(review.toJSON()) %>",
        "<% }); %>",
    ].join('')),
    // render View
    render: function() {
        this.collectionFetch = this.collection.fetch();
        var self = this;
        this.reviewThumbLoad.done(function(markup) {
            // apply to model, inject to Details view
            self.reviewTemplate = _.template(markup);
            
            self.collectionFetch.done(function(coll, resp){
                self.$el.html(self.reviewsTemplate({
                    reviews: self.collection,
                    reviewTemplate: self.reviewTemplate
                }));
            }).fail(function(coll, resp) {
                alert("Fetch reviews failed!");
            });
            /*
            self.$el.html(self.reviewsTemplate({
                reviews: self.collection,
                reviewTemplate: self.reviewTemplate
            }));
            */
        });
        return this; // support method chaining
    }

});