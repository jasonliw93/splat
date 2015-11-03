// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Home) matches name of template file Home.html
splat.ReviewsView = Backbone.View.extend({
    // render the View
    initialize: function(options) {
        this.reviewerView = new splat.Reviewer({
            model : this.model
        });
        this.reviewThumbsView = new splat.ReviewThumbs({
            model : this.model
        });
        var self = this;
        this.listenTo(this.model.reviews, 'sync', function(e,data){
            this.reviewThumbsView.render();
            this.showScore();
        });
        
    },
    showScore: function(){
        var freshTotal = this.model.get('freshTotal');
        var freshVotes = this.model.get('freshVotes');
        if (freshTotal){
            this.$('#rating').html(freshVotes/freshTotal);
        }else{
            this.$('#rating').html('… no reviews yet');
        }
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
        this.showScore();
        return this; // support method chaining
    }

});