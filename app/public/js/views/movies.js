// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Home) matches name of template file Home.html
splat.MoviesView = Backbone.View.extend({
    // render the View
    events:{
        "click .video-container": "playVideo"
    },
    initialize: function() {
        this.movieThumbView = new splat.MovieThumb();
        this.listenTo(Backbone, 'orderevent', function(){
            // set the comparator for the model used by sort
            this.collection.comparator = function(movie) {
                return movie.get(splat.order).toLowerCase();
            };
            // sort collection before rendering it - implicitly uses comparator
            this.collection.sort();
            // re render view
            this.render();
        });
        // listens to collection sync to re-render
        this.listenTo(this.collection, 'sync', this.render);
    },
    // handle play on video for whole video container
    playVideo: function(e){
        e.target.play();
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
        this.$(".trailer source").on('error', function(e){
            splat.utils.showNotice('Error', "Video not found", 'alert-danger');
        });
        this.$('[data-toggle="tooltip"]').tooltip()
        // support chaining
        return this;
    },

});