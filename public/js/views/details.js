// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat =  splat || {};

// note View-name (Home) matches name of template file Home.html
splat.Details = Backbone.View.extend({
    // render the View
    initialize: function(){
    	this.MovieFormView = new splat.MovieForm({collection:this.collection, model:this.model});
		this.MoviePosterView = new splat.MoviePoster({collection:this.collection, model:this.model});
    },
    onClose: function(){
    	this.MovieFormView.close();
    	this.MoviePosterView.close();
    },
    render: function () {
	// set the view element ($el) HTML content using its template
		this.$el.html(this.template());
		this.$('#movieform').html(this.MovieFormView.render().el);
		this.$('#movieposter').html(this.MoviePosterView.render().el);
		return this;    // support method chaining
    }

});
