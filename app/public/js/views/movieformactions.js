// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (MovieFormActions) matches name of template file MovieForm.html
splat.MovieFormActions = Backbone.View.extend({
    initialize: function() {
        this.isNew = this.model.isNew();
        var self = this;
        // listens to model to refrain users from changing an attribute
        // a removed model
        this.listenTo(this.model, 'remove', function(model){
            splat.app.navigate('#movies', {
                    replace: true,
                    trigger: true
            });
            splat.utils.showNotice('Error', "Movie has been removed since last opened", 'alert-warning');
        });
        this.listenTo(this.model, 'change:freshTotal', this.render);
    },
    events: {
        "click #moviesave": "beforeSave",
        "click #moviedel": "destroy",
    },
    // save model to database
    beforeSave: function(){
        if (this.model.isValid()){
            this.save();
        }else{
            splat.utils.showNotice('Error', this.model.validationError, 'alert-danger');
            // add validation error for each invalid message in invalid object 
            for (var key in this.model.invalid) {
                splat.utils.addValidationError(key, this.model.invalid[key]);
            }
        }
    },
    save: function() {
        var self = this;
        // adds model to collection and save model to database
        this.model.collection.create(this.model, {
            wait: true,
            success: function(model, response) {
                // if image was uploaded replace dataURL to image link
                var targetImgElt = $('#detailsImage')[0];
                targetImgElt.src = model.get('poster');
                // navigate to the edit view upon success
                if (self.isNew) {
                    splat.app.navigate('#movies/' + self.model.id, {replace:true, trigger:false});
                }
                splat.utils.showNotice('Success!', 'Movie saved', 'alert-success');
                self.render();
            },
            error: function(model, response) {
                splat.utils.requestFailed(response);
            }
        });
    },
    // destroys model from database
    destroy: function() {
        this.model.destroy({
            wait: true, // don't destroy client model until server responds
            success: function(model, response) {
                // later, we'll navigate to the browse view upon success
                splat.app.navigate('#movies', {
                    replace: true,
                    trigger: true
                });
                // notification panel, defined in section 2.6
                splat.utils.showNotice('Success', "Movie deleted", 'alert-success')
            },
            error: function(model, response) {
                // display the error response from the server
                splat.utils.requestFailed(response);
            }
        });

    },
    // render the View
    render: function() {
        // set the view element ($el) HTML content using its template
        this.$el.html(this.template(this.model.toJSON()));
        return this; // support method chaining
    }

});