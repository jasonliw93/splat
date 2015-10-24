// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Home) matches name of template file Home.html
splat.MoviesView = Backbone.View.extend({
    // render the View
    initialize: function() {
        this.movieThumbLoad = $.get('tpl/MovieThumb.html');
        this.collectionFetch = this.collection.fetch();
        var socket = io.connect('http://mathlab.utsc.utoronto.ca:41260');
        socket.emit('subscribe', 'movies');
        var self = this;
        socket.on('update', function(data) {
            console.log(data);
            self.collectionFetch = self.collection.fetch();
            self.render();
        });
    },
    
    // function to combine movie JSON data for rendering to HTML
    moviesTemplate: _.template([
        "<% movies.each(function(movie) { %>",
        "<%= movieTemplate(movie.toJSON()) %>",
        "<% }); %>",
    ].join('')),
    // render View
    render: function() {
        var self = this;
        this.movieThumbLoad.done(function(markup) {
            // apply to model, inject to Details view
            self.movieTemplate = _.template(markup);
            self.collectionFetch.done(function(coll, resp){
                self.$el.html(self.moviesTemplate({
                    movies: self.collection,
                    movieTemplate: self.movieTemplate
                }));
            }).fail(function(coll, resp) {
                alert("Fetch movies failed!");
            });
        });
        return this; // support method chaining
    }

});