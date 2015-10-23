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
        // instantiate a Header view
        this.headerView = new splat.Header();
        // insert the rendered Header view element into the document DOM
        $('.header').html(this.headerView.render().el);

        this.movies = new splat.Movies();
        // fetches the movies
        this.moviesFetch = this.movies.fetch();
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
        var self = this;
        this.moviesFetch.done(function(coll, resp) {
            // If the Browse view doesn't exist, instantiate one\
            if (!self.moviesView){
                //gets the movies
                self.moviesView = new splat.MoviesView({
                    collection: self.movies
                });
            }
            // insert the rendered Browse view element into the document DOM
            self.showView('#content', self.moviesView);
            self.headerView.selectMenuItem("Browse Movies");
        }).fail(function(coll, resp) {
            alert("Fetch movies failed!");
        });
    },
    addHandler: function() {
        // get movies and instantiate Details view
        this.movie = new splat.Movie();
        this.detailsView = new splat.Details({
            collection: this.movies,
            model: this.movie
        });
        // insert the rendered Home view element into the document DOM
        this.showView('#content', this.detailsView);
        this.headerView.selectMenuItem("Add Movie");
    },
    editHandler: function(id) {
        var self = this;
        this.moviesFetch.done(function(coll, resp) {
            // get movies and instantiate Details view
            self.movie = self.movies.get(id);
            self.detailsView = new splat.Details({
                collection: self.movies,
                model: self.movie
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
            self.movie = self.movies.get(id);
            self.reviews = new splat.Reviews();

            self.reviewsFetch = self.reviews.fetch();
            self.reviewsFetch.done(function(coll, resp) {
                console.log(self.reviews);
                self.reviewsView = new splat.ReviewsView({
                    movieId : id,
                    collection: self.reviews,
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

splat.utils.loadTemplates(['Home', 'Header', 'About', 'Details', 'ReviewsView', 'MovieForm', 'MoviePoster', 'Reviewer', 'ReviewThumbs'], function() {
    splat.app = new splat.AppRouter();
    Backbone.history.start();
});