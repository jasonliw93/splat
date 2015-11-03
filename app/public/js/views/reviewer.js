// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (reviewForm) matches name of template file reviewForm.html
splat.Reviewer = Backbone.View.extend({
    initialize: function(options) {
        //this.movieId = options.movieId;
        //this.reviewFormLoad = $.get('tpl/.html');
    },
    events: {
        "click #reviewsave": "save",
    },
    // save model to database
    save: function() {
        //splat.utils.hideNotice();
        // check if model is valid before adding to collection
        var obj = {
            rating : $(".form-group input[type=radio]:checked:first").val(),
            reviewName : $(".form-group input[name=reviewName]").val() ,
            reviewAffil : $(".form-group input[name=reviewAffil]").val() ,
            reviewText : $(".form-group textarea[name=reviewText]").val() ,
            movieId : this.collection.movieId,
        }
        var self = this;
        // adds model to collection and save model to database
        this.collection.create(obj, {
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
        this.$el.html(this.template());
        this.$('#rating').html(this.collection.getRating());
        return this; // support method chaining
    }
});