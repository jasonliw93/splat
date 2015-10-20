// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (MovieForm) matches name of template file MovieForm.html
splat.MovieForm = Backbone.View.extend({
    initialize: function() {
        this.movieFormLoad = $.get('tpl/MovieForm.html');
        var self = this;
        this.model.on('invalid', function(model, error) {
            splat.utils.showNotice('Error', error, 'alert-danger');
            for (var key in self.model.invalid) {
                splat.utils.addValidationError(key, self.model.invalid[key]);
            }
        });
    },
    events: {
        "click #moviesave": "save",
        "click #moviedel": "destroy",
        "change .form-group input": "change",
        "change .form-group textarea": "change",
    },
    change: function(e) {
        splat.utils.hideNotice();
        var obj = {};
        var name = e.target.name
        var value = e.target.value
        if (name == 'starring' || name == 'genre') {
            obj[name] = value.split(",").map(Function.prototype.call, String.prototype.trim);
        } else if (name == 'duration'){
            obj[name] = Number(value);
        } else {
            obj[name] = value;
        }
        this.model.set(obj);
        splat.utils.showNotice('Note!', 'Movie Attribute udated, to make changes permanent, click "Save Changes" button', 'alert-info');
        var check = this.model.validateItem(name);
        check.isValid ?
            splat.utils.removeValidationError(name) : splat.utils.addValidationError(name, check.message);
    },
    save: function() {
        splat.utils.hideNotice();
        var self = this;
        this.collection.create(this.model, {
            success: function(model, response) {
                // later, we'll navigate to the browse view upon success
                wait: true,
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
    },
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