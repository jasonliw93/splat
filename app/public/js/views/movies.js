// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Home) matches name of template file Home.html
splat.MoviesView = Backbone.View.extend({
    // render the View
    initialize: function() {
        this.movieThumbLoad = $.get('tpl/MovieThumb.html');
        var self = this;
        splat.utils.watcher.on('ordering', function(data){
            self.collection.comparator = function(model) {
                return model.get(data).toLowerCase();;
            }
            // call the sort method
            self.collection.sort();
            self.render();
        });
        this.listenTo(this.collection, 'sync', function(e,data){
            self.render();
        });
    },
    // function to combine movie JSON data for rendering to HTML
    moviesTemplate: _.template([
        "<% movies.each(function(movie) { %>",
        "<%= movieTemplate(movie.toJSON()) %>",
        "<%= console.log(movie.toJSON()) %>",
        "<% }); %>",
    ].join('')),
    // render View
    render: function() {
        var self = this;
        this.movieThumbLoad.done(function(markup) {
            // apply to model, inject to Details view
            self.movieTemplate = _.template(markup);
                self.$el.html(self.moviesTemplate({
                    movies: self.collection,
                    movieTemplate: self.movieTemplate
                }));
        });
        return this; // support method chaining
    }

});