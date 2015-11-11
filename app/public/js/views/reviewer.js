// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (reviewForm) matches name of template file reviewForm.html
splat.Reviewer = Backbone.View.extend({
    events: {
        "click #reviewsave": "save",
        "change .form-group input": "change",
        "change .form-group textarea": "change",
    },
    // save model to database
    change: function(e) {
        var obj = {};
        // properly format string input depending on field name
        obj[e.target.name] = e.target.value;
        // set the model to the changed values
        this.review.set(obj);
    },
    // save model to database
    save: function() {
        //splat.utils.hideNotice();
        // check if model is valid before adding to collection
        var self = this;
        // adds model to collection and save model to database
        this.collection.create(this.review, {
            // notification panel, defined in section 2.6
            wait: true,
            success : function (model, response){
                splat.utils.showNotice('Success', "review has been saved", 'alert-success');
                self.render();
            },
            error: function(model, response) {
                splat.utils.requestFailed(response);
            }
        });

    },
    // render the View
    render: function() {
        // set the view element ($el) HTML content using its template
        this.review = new splat.Review();
        this.$el.html(this.template(this.review.toJSON()));
        return this; // support method chaining
    }
});