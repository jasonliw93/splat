// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat =  splat || {};

// note View-name (Home) matches name of template file Home.html
splat.Details = Backbone.View.extend({
	events: {
        "click #moviesave":  'save',
        'click #moviedel': 'destroy'
    },
    save: function (){
    	alert('save');
    	this.model.save({
			wait: true,  // don't destroy client model until server responds
			success: function(model, response) {
			// later, we'll navigate to the browse view upon success
			    splat.app.navigate('#', {replace:true, trigger:true});
			// notification panel, defined in section 2.6
			    splat.utils.showAlert('Success', "Movie added", 'alert-success')
			},
			error: function(model, response) {
			// display the error response from the server
			    splat.utils.requestFailed(response);
			}
		});
    },
    destroy: function(){
    	alert('destroy');
    	this.model.destroy({
			wait: true,  // don't destroy client model until server responds
			success: function(model, response) {
			// later, we'll navigate to the browse view upon success
			    splat.app.navigate('#', {replace:true, trigger:true});
			// notification panel, defined in section 2.6
			    splat.utils.showAlert('Success', "Movie deleted", 'alert-success')
			},
			error: function(model, response) {
			// display the error response from the server
			    splat.utils.requestFailed(response);
			}
		});

    },
    // render the View
    render: function () {
	// set the view element ($el) HTML content using its template
	this.$el.html(this.template());
	$.get('tpl/MovieForm.html', function(markup) {
		$('#movieform').html(markup);
	// callback to convert markup to template,
	// apply to model, inject to Details view
	})
	return this;    // support method chaining
    }

});
