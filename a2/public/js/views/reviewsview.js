// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Home) matches name of template file Home.html
splat.ReviewsView = Backbone.View.extend({
    // render the View
    initialize: function(options) {
        this.movieId = options.movieId;
        this.Reviewer = new splat.Reviewer({
            parent : this,
            movieId : this.movieId,
            collection : this.collection
        });
        this.ReviewThumbs = new splat.ReviewThumbs({
            movieId : this.movieId,
            collection : this.collection
        });
    },
    onClose: function() {
        splat.utils.hideNotice();
        this.Reviewer.close();
        this.ReviewThumbs.close();
    },
    load: function() {
        this.$('#reviewer').html(this.Reviewer.render().el);
        this.$('#reviewthumbs').html(this.ReviewThumbs.render().el);
        this.Reviewer.delegateEvents();
    },
    // render View
    render: function() {
        // set the view element ($el) HTML content using its template
        this.$el.html(this.template());
        // render the sub views
        this.load();
        return this; // support method chaining
    }

});