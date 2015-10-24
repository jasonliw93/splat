// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Home) matches name of template file Home.html
splat.ReviewsView = Backbone.View.extend({
    // render the View
    initialize: function(options) {
        this.movieId = options.movieId;
        this.reviewerView = new splat.Reviewer({
            parent : this,
            movieId : this.movieId,
            collection : this.collection
        });
        this.reviewThumbsView = new splat.ReviewThumbs({
            movieId : this.movieId,
            collection : this.collection
        });
    },
    onClose: function() {
        splat.utils.hideNotice();
        this.reviewerView.close();
        this.reviewThumbsView.close();
    },
    load: function() {
        this.$('#reviewer').html(this.reviewerView.render().el);
        this.$('#reviewthumbs').html(this.reviewThumbsView.render().el);
        this.reviewerView.delegateEvents();
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