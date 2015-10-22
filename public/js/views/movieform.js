// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (MovieForm) matches name of template file MovieForm.html
splat.MovieForm = Backbone.View.extend({
    initialize: function() {
        this.movieFormLoad = $.get('tpl/MovieForm.html');
    },
    events: {
        "click #moviesave": "save",
        "click #moviedel": "destroy",
        "change .form-group input": "change",
        "change .form-group textarea": "change",
    },
    // handles change form fields event
    change: function(e) {
        splat.utils.hideNotice();
        var obj = {};
        var name = e.target.name
        var value = e.target.value
        // properly format string input depending on field name.
        if (name == 'starring' || name == 'genre') {
            // split string then call trim on each value
            obj[name] = value.split(",").map(Function.prototype.call, String.prototype.trim);
        } else if (name == 'duration'){
            obj[name] = Number(value);
        } else {
            obj[name] = value;
        }
        // set the model to the changed values
        this.model.set(obj);
        splat.utils.showNotice('Note!', 'Movie Attribute updated, to make changes permanent, click "Save Changes" button', 'alert-info');
        var check = this.model.validateItem(name);
        // checks if the new changes are valid
        check.isValid ?
            splat.utils.removeValidationError(name) : splat.utils.addValidationError(name, check.message);
    },
    // save model to database
    save: function() {
        splat.utils.hideNotice();
        // check if model is valid before adding to collection
        if (this.model.isValid()){
            var self = this;
            // adds model to collection and save model to database
            this.collection.create(this.model, {
                success: function(model, response) {
                    wait: true,
                    // navigate to the edit view upon success
                    splat.app.navigate('#movies/' + self.model.id, {
                        replace: true,
                        trigger: false
                    });
                    // notification panel, defined in section 2.6
                    splat.utils.showNotice('Success', "Movie has been saved", 'alert-success');
                },
                error: function(model, response) {
                    splat.utils.requestFailed(response);
                }
            });
        }else{
            splat.utils.showNotice('Error', this.model.validationError, 'alert-danger');
            // add validation error for each invalid message in invalid object 
            for (var key in this.model.invalid) {
                splat.utils.addValidationError(key, this.model.invalid[key]);
            }
        }
    },
    // destroys model from database
    destroy: function() {
        splat.utils.hideNotice();
        this.model.destroy({
            wait: true, // don't destroy client model until server responds
            success: function(model, response) {
                // later, we'll navigate to the browse view upon success
                splat.app.navigate('#', {
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
        var self = this;
        this.movieFormLoad.done(function(markup) {
            self.movieFormTemplate = _.template(markup);
            self.$el.html(self.movieFormTemplate(self.model.toJSON()));
            // apply to model, inject to Details view
        });
        return this; // support method chaining
    }

});