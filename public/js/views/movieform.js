// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat =  splat || {};

// note View-name (Home) matches name of template file Home.html
splat.MovieForm = Backbone.View.extend({
	events: {
        "click #moviesave":  "save",
        "click #moviedel": "destroy",
        "focusout .form-group input": "update",
    },
    
    update: function (e){
    	var changed = e.currentTarget;
       	var value = $(e.currentTarget).val();
       	var obj = {};
       	obj[changed.name] = value;
       	this.model.set(obj);
       	console.log('Collection models: ', this.collection);
		console.log('model: ', this.model);
    },
    save: function (){
    	var self = this;
    	this.collection.create(this.model, {
			wait: true,  // don't destroy client model until server responds
			success: function(model, response) {
			// later, we'll navigate to the browse view upon success
			    splat.app.navigate('#movies/' + self.model.id , {replace:true, trigger:true});
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
		console.log(this);
		this.$el.html(this.template(this.model.toJSON()));
		return this;    // support method chaining
    }

});
