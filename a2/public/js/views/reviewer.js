// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (reviewForm) matches name of template file reviewForm.html
splat.Reviewer = Backbone.View.extend({
    initialize: function() {
        this.reviewFormLoad = $.get('tpl/ReviewForm.html');
    },
    events: {
        "click #reviewsave": "save",
    },
    // save model to database
    save: function() {
        splat.utils.hideNotice();
        // check if model is valid before adding to collection
        if (this.model.isValid()){
            var self = this;
            // adds model to collection and save model to database
            var obj = {};
            this.collection.create(obj, {
                // notification panel, defined in section 2.6
                success : function (model, response){
                    splat.utils.showNotice('Success', "review has been saved", 'alert-success');
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
    // render the View
    render: function() {
        // set the view element ($el) HTML content using its template
        var self = this;
        this.reviewFormLoad.done(function(markup) {
            self.reviewFormTemplate = _.template(markup);
            self.$el.html(self.reviewFormTemplate());
            // apply to model, inject to Details view
        });
        return this; // support method chaining
    }
});