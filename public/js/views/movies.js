// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat =  splat || {};

// note View-name (Home) matches name of template file Home.html
splat.MoviesView = Backbone.View.extend({
    // render the View
    initialize: function() {
    	this.movieThumbLoad = $.get('tpl/MovieThumb.html');
    },
    render: function () {
    	var self = this;
		this.movieThumbLoad.done(function(markup) {
				// apply to model, inject to Details view
			self.movieTemplate = _.template(markup);
			
			self.collection.each(function(model) {
			   var obj = model.toJSON();
			   obj["id"] = model.id;
			   self.$el.append(self.movieTemplate(obj));
			}, self)
		});
	// set the view element ($el) HTML content using its template
		return this;    // support method chaining
    }

});
