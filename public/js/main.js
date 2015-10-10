// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat =  splat || {};

// Define Backbone router
splat.AppRouter = Backbone.Router.extend({

    // Map "URL paths" to "router functions"
    routes: {
        "": "home",
        "about": "about",
        "movies": "browse",
        "movies/add": "addHandler",
        "movies/:id": "editHandler",
        "*default": "home",
    },
    /* Invoke close() on the currentView before replacing it with the
       new view, to avoid memory leaks and ghost views.
       Note that for composite views (views with subviews), must make sure
       to close â€œchildâ€ views when the parent is closed.  The parent view
       should keep track of its child views so it can call their respective
       close() methods when its own close() method is invoked. */
    showView: function(selector, view) {
        console.log("showing view", view);
        if (this.currentView) {
            this.currentView.close();
        }
        this.currentView = view;
        $(selector).html(view.render().el);
    },
    // When an instance of an AppRouter is declared, create a Header view
    initialize: function() {
	// instantiate a Header view
        this.headerView = new splat.Header();
	// insert the rendered Header view element into the document DOM
        $('.header').html(this.headerView.render().el);
        if (!this.movies) {
            this.movies = new splat.Movies();
        };
        this.moviesFetch = this.movies.fetch();
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
    browse: function() {
    // If the Home view doesn't exist, instantiate one\
        var self = this;
        this.moviesFetch.done(function(coll, resp) {
            // get movie and instantiate
            if (!self.moviesView) {
                self.moviesView = new splat.MoviesView({collection:self.movies});
            };
            // insert the rendered Home view element into the document DOM
            self.showView('#content', self.moviesView);
            self.headerView.selectMenuItem("Browse Movies");
        }).fail(function(coll, resp) {
            alert("Fetch movies failed!");
        });
    },
    addHandler: function() {
    // If the Home view doesn't exist, instantiate one\
        var self = this;
        this.moviesFetch.done(function(coll, resp) {
            // get movie and instantiate
            // Details view
            self.movie = new splat.Movie();
            self.detailsView = new splat.Details({collection:self.movies, model:self.movie});
            // insert the rendered Home view element into the document DOM
            self.showView('#content', self.detailsView);
            self.headerView.selectMenuItem("Add Movie");
        }).fail(function(coll, resp) {
            alert("Fetch movies failed!");
        });

    },
    editHandler: function(id) {
    // If the Home view doesn't exist, instantiate one\
        var self = this;
        this.moviesFetch.done(function(coll, resp) {
            // get movie and instantiate
            // Details view
            self.movie = self.movies.get(id);
            self.detailsView = new splat.Details({collection:self.movies, model:self.movie});
            // insert the rendered Home view element into the document DOM
            self.showView('#content', self.detailsView);
            self.headerView.selectMenuItem("Browse Movies");
        }).fail(function(coll, resp) {
            alert("Fetch movies failed!");
        });
    },
    about: function() {
    // If the Home view doesn't exist, instantiate one

        if (!this.aboutView) {
            this.aboutView = new splat.About();
        };
        // insert the rendered Home view element into the document DOM
        this.showView('#content', this.aboutView);
        this.headerView.selectMenuItem("About");
    }

});

// Load HTML templates for Home, Header, About views, and when
// template loading is complete, instantiate a Backbone router
// with history.

splat.utils.loadTemplates(['Home', 'Header', 'About', 'Details'], function() {
    splat.app = new splat.AppRouter();
    Backbone.history.start();
});
