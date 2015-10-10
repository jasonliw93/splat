// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Home) matches name of template file Home.html
splat.MoviePoster = Backbone.View.extend({
    initialize: function() {
        this.moviePosterLoad = $.get('tpl/MoviePoster.html');
    },
    events: {
        "change #selectImage": "selectImage",
        "dragover #imageCanvas": "dragoverHandler",
        "drop #imageCanvas": "dropHandler",
    },
    selectImage: function(event) {
        // set object attribute for image uploader
        this.pictureFile = event.target.files[0];
        // if the file type is image, read it
        if (this.pictureFile.type.startsWith("image/")) {
            this.imageRead(this.pictureFile, this.pictureFile.type);
        }
        // else display error notification
    },
    imageRead: function(pictureFile, type) {
        var self = this;
        var reader = new FileReader();
        // callback for when read operation is finished
        reader.onload = function(event) {
            self.setCanvasImage(reader.result);
        };
        reader.readAsDataURL(pictureFile); // read image file
    },
    dragoverHandler: function(event) {
        // don't let parent element catch event
        event.stopPropagation();
        // prevent default to enable drop event
        event.preventDefault();
        // jQuery event doesn’t have dataTransfer
        // field - so use originalEvent
        event.originalEvent.dataTransfer.dropEffect = 'copy';
    },
    dropHandler: function(event) {
        event.currentTarget.className = '';
        event.stopPropagation();
        event.preventDefault();
        var ev = event.originalEvent;
        // set object attribute for use by uploadPicture
        this.pictureFile = ev.dataTransfer.files[0];
        // only process image files
        if (this.pictureFile.type.startsWith("image/")) {
            // Read image file and display in img tag
            this.imageRead(this.pictureFile, this.pictureFile.type);
        }
        // else display notification error
    },
    setCanvasImage: function(image) {
        var canvas = this.$('#imageCanvas')[0]
        var ctx = canvas.getContext('2d');
        var img = new Image();
        var self = this;
        img.onload = function() {
            ctx.drawImage(img, 0, 0, img.width, img.height,
                0, 0, canvas.width, canvas.height);
            self.model.set('poster', canvas.toDataURL());
        };
        img.src = image;
    },
    // render the View
    render: function() {
        // set the view element ($el) HTML content using its template
        var self = this;
        this.moviePosterLoad.done(function(markup) {
            self.moviePosterTemplate = _.template(markup);
            self.$el.html(self.moviePosterTemplate());
            self.setCanvasImage(self.model.get('poster'));
        });
        return this; // support method chaining
    }
});