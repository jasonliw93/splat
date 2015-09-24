// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat =  splat || {};

// note View-name (Home) matches name of template file Home.html
splat.Header = Backbone.View.extend({

    // render the View
    render: function () {
	// set the view element ($el) HTML content using its template
	this.$el.html(this.template());
	return this;    // support method chaining
    },

    selectMenuItem: function (menuItem) {
        //removes any active classes under <nav><li>
   		$('.nav li').removeClass('active');
        //actives any tags associated to menuItem
    	$('.nav a:contains('+ menuItem +')').parent().addClass('active');
    }
});