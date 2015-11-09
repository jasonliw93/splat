// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Home) matches name of template file Home.html
splat.MoviesView = Backbone.View.extend({
    // render the View
    initialize: function() {
        this.movieThumbView = new splat.MovieThumb();
        this.listenTo(Backbone, 'orderevent', function(){
            this.collection.comparator = function(movie) {
                return movie.get(splat.order).toLowerCase();
            };
            // sort collection before rendering it - implicitly uses comparator
            this.collection.sort();
            this.render();
        });
        this.listenTo(this.collection, 'sync', this.render);
    },
    // function to combine movie JSON data for rendering to HTML
    moviesTemplate: _.template([
        "<% movies.each(function(movie) { %>",
        "<%= movieTemplate(movie.toJSON()) %>",
        "<% }); %>",
    ].join('')),
    // render View
    render: function() {
        $(this.el).html(this.moviesTemplate({
            movies: this.collection,
            movieTemplate: this.movieThumbView.template
            })
        );
        // support chaining
        return this;
    },

});