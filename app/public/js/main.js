// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// Define Backbone router
splat.AppRouter = Backbone.Router.extend({

    // Map "URL paths" to "router functions"
    routes: {
        "": "home",
        "about": "about",
        "movies": "browse",
        "movies/add": "addHandler",
        "movies/:id": "editHandler",
        "movies/:id/reviews" : "reviews",
        "*default": "home",
    },
    // When an instance of an AppRouter is declared, create a Header view
    initialize: function() {
        this.movies = new splat.Movies();
        // fetches the movies
        this.moviesFetch = this.movies.fetch();
        

        var stream = new EventSource('/sse')
        var self = this;
        stream.onmessage = function(e) {
            var data = JSON.parse(e.data);
            console.log(data);
            if (data.model == 'movie') { 
                self.moviesFetch = self.movies.fetch();
            } else if (data.model == 'review'){
                self.moviesFetch = self.movies.fetch();
                self.moviesFetch.done(function(coll, resp) {
                    var movie = self.movies.get(data.movieId);
                    if (movie.reviews){
                        movie.reviews.fetch();
                    }
                }).fail(function(coll, resp) {
                    alert("Fetch movies failed!");
                });
            } else {
                console.log(data,e.data);
            }
        }
        
        // instantiate a Header view
        this.headerView = new splat.Header();
        // insert the rendered Header view element into the document DOM
        $('.header').html(this.headerView.render().el);

    },
    /* Invoke close() on the currentView before replacing it with the
       new view, to avoid memory leaks and ghost views.
       Note that for composite views (views with subviews), must make sure
       to close child's views when the parent is closed.  The parent view
       should keep track of its child views so it can call their respective
       close() methods when its own close() method is invoked. */
    showView: function(selector, view) {
        if (this.currentView) {
            this.currentView.close();
        }
        //current view becomes the new view so that we can render the view element
        this.currentView = view;
        $(selector).html(view.render().el);

    },
    home: function() {
        // If the Home view doesn't exist, instantiate one
        if (!this.homeView) {
            this.homeView = new splat.Home();
        };
        // insert the rendered Home view element into the document DOM
        //$('#content').html(this.homeView.render().el);
        this.showView('#content', this.homeView);
        this.headerView.selectMenuItem("Splat!");
    },
    about: function() {
        // If the About view doesn't exist, instantiate one
        if (!this.aboutView) {
            this.aboutView = new splat.About();
        };
        // insert the rendered About view element into the document DOM
        this.showView('#content', this.aboutView);
        this.headerView.selectMenuItem("About");
    },
    browse: function() {
        this.moviesFetch = this.movies.fetch();
        var self = this;
        this.moviesFetch.done(function(coll, resp) {
            self.moviesView = new splat.MoviesView({
                collection: self.movies
            });
            // insert the rendered Browse view element into the document DOM
            self.showView('#content', self.moviesView);
            self.headerView.selectMenuItem("Browse Movies");
        }).fail(function(coll, resp) {
            alert("Fetch movies failed!");
        });
    },
    addHandler: function() {
        // get movies and instantiate Details view
        var movie = new splat.Movie();
        movie.collection = this.movies;
        this.detailsView = new splat.Details({
            model: movie
        });
        // insert the rendered Home view element into the document DOM
        this.showView('#content', this.detailsView);
        this.headerView.selectMenuItem("Add Movie");
    },
    editHandler: function(id) {
        var self = this;
        this.moviesFetch.done(function(coll, resp) {
            // get movies and instantiate Details view
            var movie = self.movies.get(id);
            //movie.reviews.url = '/movies/' + movie._id + '/reviews';
            self.detailsView = new splat.Details({
                model: movie
            });
            // insert the rendered Detail view element into the document DOM
            self.showView('#content', self.detailsView);
            self.headerView.selectMenuItem("Add Movie");
        }).fail(function(coll, resp) {
            alert("Fetch movies failed!");
        });
    },
    reviews : function(id){
        var self = this;
        this.moviesFetch.done(function(coll, resp) {
            // get movies and instantiate Details view
            var movie = self.movies.get(id);
            if (!movie.reviews){
                movie.reviews =  new splat.Reviews(id);
            }
            var reviewsFetch = movie.reviews.fetch();
            reviewsFetch.done(function(coll, resp) {
                self.reviewsView = new splat.ReviewsView({
                    model: movie,
                });
                self.showView('#content', self.reviewsView);
            }).fail(function(coll, resp) {
                alert("Fetch reviews failed!");
            });
            
        }).fail(function(coll, resp) {
            alert("Fetch movies failed!");
        });
    }
});

// Load HTML templates for Home, Header, About views, and when
// template loading is complete, instantiate a Backbone router
// with history.

splat.utils.loadTemplates(['Home', 'Header', 'About', 'Details', 
    'MovieThumb', 'MovieForm', 'MovieFormActions', 'MoviePoster', 
    'ReviewsView','Reviewer', 'ReviewThumb'], function() {
    splat.app = new splat.AppRouter();
    Backbone.history.start();
});


Backbone.View.prototype.close = function() {
    /* When closing a view, give it a chance to perform it's own custom
     * onClose processing, e.g. handle subview closes, then remove the
     * view from the DOM and unbind events from it.  Based on approach
     * suggested by D. Bailey (author of Marionette) */
    if (this.onClose) {
        this.onClose();
    }
    this.remove();
    this.unbind(); // Note, implied by remove() in BB 1.0.0 and later

};