// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Home) matches name of template file Home.html
splat.ReviewThumbs = Backbone.View.extend({
    // render the View
    initialize: function(options) {
        this.movieId = options.movieId;
        this.collectionFetch = this.collection.fetch();
        var socket = io.connect('http://mathlab.utsc.utoronto.ca:41260');
        socket.emit('subscribe', 'reviews');
        var self = this;
        socket.on('update', function(data) {
            console.log(data);
            self.collectionFetch = self.collection.fetch();
            self.render();
        });
        //this.reviewThumbLoad = $.get('tpl/.html');
    },
    moviesTemplate: _.template([
        "<% reviews.forEach(function(review) { %>",
        "<%= reviewTemplate(review.toJSON()) %>",
        "<% }); %>",
    ].join('')),
    // render View
    render: function() {
        var self = this;
        self.collectionFetch.done(function(coll, resp){      
            self.$el.html(self.moviesTemplate({
                reviews: self.collection.where({movieId : self.movieId}),
                reviewTemplate: self.template
            }));
        }).fail(function(coll, resp) {
            alert("Fetch reviews failed!");
        });

        return this; // support method chaining
    }

});