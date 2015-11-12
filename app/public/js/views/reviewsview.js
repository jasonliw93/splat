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
        // listens to collection sync to re-render
        this.listenTo(this.collection, 'sync', function(e){
            this.reviewThumbsView.render();
            this.showScore();
        });
        
    },
    // shows the overall score of the movie from the collection
    showScore: function(){
        var freshVotes = 0;
        this.collection.each(function (model){
            freshVotes += model.get('freshness');
        });
        var freshTotal = this.collection.length;
        // displays certain gif according to score ratings
        if (freshTotal){
            if (freshVotes/freshTotal >= 0.5) { 
                this.$('#freshnessimg').attr('src','/img/fresh.gif');
            }else{
                this.$('#freshnessimg').attr('src','/img/rotten.gif');
            }
            this.$('#freshness').html((freshVotes/freshTotal*100).toFixed(1) + '% (' + freshTotal+ ')');
        }else{
            this.$('#freshness').html('… no reviews yet');
        }
    },
    // closes the review
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
        // show the score
        this.showScore();
        return this; // support method chaining
    }
});