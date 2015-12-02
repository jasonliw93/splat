// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (MovieFormActions) matches name of template file MovieForm.html
splat.MovieFormActions = Backbone.View.extend({
    initialize: function() {
        this.isNew = this.model.isNew();
        // listens to model to refrain users from changing an attribute
        // a removed model
        this.listenTo(this.model, 'change:freshTotal', this.render);
    },
    events: {
        "click #moviesave": "beforeSave",
        "click #moviedel": "destroy",
    },
    // save model to database
    beforeSave: function(){
        var check = this.model.validateAll();
        if (check.isValid === false) {
            splat.utils.displayValidationErrors(check.messages);
            return false;
        };
        this.save();
    },
    save: function() {
        var self = this;
        // adds model to collection and save model to database
        this.model.collection.create(this.model, {
            wait: true,
            success: function(model) {
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
            success: function() {
                // later, we'll navigate to the browse view upon success
                splat.app.navigate('#movies', {
                    replace: true,
                    trigger: true
                });
                // notification panel, defined in section 2.6
                splat.utils.showNotice('Success', "Movie deleted", 'alert-success');
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
