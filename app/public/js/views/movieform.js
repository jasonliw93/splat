// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (MovieForm) matches name of template file MovieForm.html
splat.MovieForm = Backbone.View.extend({
    initialize: function() {
    },
    events: {
        "change .form-group input[type=text]": "change",
        "change .form-group textarea": "change",
        "change #selectVideo": "uploadVideo",
    },
    progressHandling: function(e){
        var percent = e.loaded/e.total * 100;
        if (percent == 100){
            $('input[name=trailer]').removeClass('hidden');
            $('.progress').addClass('hidden');
            $('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
            splat.utils.showNotice('Note!', 'Video has been uploaded', 'alert-info');
        }else{
            $('.progress-bar').css('width', percent+'%').attr('aria-valuenow', percent);
        }
    },
    uploadVideo: function(e){
        if (!e.target.files.length){
            return
        }
        if (e.target.files[0].size > 5 * 1024 * 1024){ //5mb limit
            splat.utils.showNotice('Warning', 'Video is too large!', 'alert-warning');
            return
        }
        if (e.target.files[0].type != "video/mp4"){ //mp4 only
            splat.utils.showNotice('Warning', 'Video must be an mp4!', 'alert-warning');
            return
        }
        if (!this.model.id){
            splat.utils.showNotice('Warning', 'Please save the movie first', 'alert-warning');
            return
        }
        var self = this;
        var formdata = new FormData();
        formdata.append("video", e.target.files[0]);
        $.ajax({
           url: "movies/" + self.model.id + "/video",
           type: "POST",
           data: formdata,
           processData: false,
           contentType: false,
            xhr: function() {  // custom xhr
                var myXhr = $.ajaxSettings.xhr();
                if(myXhr.upload){ // check if upload property exists
                    $('input[name=trailer]').addClass('hidden');
                    $('.progress').removeClass('hidden');
                    myXhr.upload.addEventListener('progress', self.progressHandling, false); // for handling the progress of the upload
                }
                return myXhr;
            },
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