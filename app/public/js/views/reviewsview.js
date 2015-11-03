// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Home) matches name of template file Home.html
splat.ReviewsView = Backbone.View.extend({
    // render the View
    initialize: function(options) {
        this.reviewerView = new splat.Reviewer({
            collection : this.collection
        });
        this.reviewThumbsView = new splat.ReviewThumbs({
            collection : this.collection
        });
        var self = this;
        this.listenTo(this.collection, 'sync', function(e,data){
            this.reviewThumbsView.render();
            $('#rating').html(this.collection.getRating());
        });
        
    },
    onClose: function() {
        this.reviewerView.close();
        this.reviewThumbsView.close();
    },
    // render View
    render: function() {
        // set the view element ($el) HTML content using its template
        this.$el.html(this.template());
        // render the sub views
        this.$('#reviewer').html(this.reviewerView.render().el);
        this.$('#reviewthumbs').html(this.reviewThumbsView.render().el);
        return this; // support method chaining
    }

});