// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (MovieForm) matches name of template file MovieForm.html
splat.MovieForm = Backbone.View.extend({
    initialize: function() {
    },
    events: {
        "change .form-group input": "change",
        "change .form-group textarea": "change",
        "change #selectVideo": "uploadVideo",
    },
    uploadVideo: function(){
        var self = this;
        var formdata = new FormData();
        formdata.append("video", $('#selectVideo')[0].files[0]);
        $.ajax({
           url: "movies/" + self.model.id + "/video",
           type: "POST",
           data: formdata,
           processData: false,
           contentType: false,
        }).done(function(res){
            var re = new RegExp(/^.*\//);
            $('input[name=trailer]').val(location.origin + res);
            self.model.set({trailer : location.origin + res});
        }).fail(function(res){
            splat.utils.requestFailed(res);
        });
    },
    // handles change form fields event
    change: function(e) {
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
    // render the View
    render: function() {
        // set the view element ($el) HTML content using its template
        this.$el.html(this.template(this.model.toJSON()));
        return this; // support method chaining
    }

});