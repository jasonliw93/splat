// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Details) matches name of template file Details.html
splat.Details = Backbone.View.extend({
    // render the View
    initialize: function() {
        this.movieFormView = new splat.MovieForm({
            model: this.model
        });
        this.moviePosterView = new splat.MoviePoster({
            model: this.model
        });
        this.movieFormActionsView = new splat.MovieFormActions({
            model: this.model
        });
    },
    // closes the sub-views before this view is unbinded and closed.
    // function is run by the modified close function provided by Alan.
    onClose: function() {
        this.movieFormView.close();
        this.movieFormActionsView.close();
        this.moviePosterView.close();
    },
    // render the View
    render: function() {
        // set the view element ($el) HTML content using its template
        this.$el.html(this.template());
        // render the sub views
        this.$('#movieposter').html(this.moviePosterView.render().el);
        this.$('#movieform').html(this.movieFormView.render().el);
        this.$('#movieformactions').html(this.movieFormActionsView.render().el);
        return this; // support method chaining
    }

});