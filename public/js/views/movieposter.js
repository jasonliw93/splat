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
        "dragover #detailsImage": "dragoverHandler",
        "drop #detailsImage": "dropHandler",
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
            var targetImgElt = $('#detailsImage')[0];
            targetImgElt.src = self.resize(reader.result);
            self.model.set('poster', targetImgElt.src);
            splat.utils.showNotice('Note!',
            'Movie Poster udated, to make changes permanent, click "Save Changes" button', 'alert-info');
            //self.setCanvasImage(reader.result);
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
    // Resize sourceImg, returning result as a DataURL value. Type,
    // quality are optional params for image-type and quality setting
    resize: function(sourceImg, type, quality) {
        var type = type || "image/jpeg"; // default MIME image type
        var quality = quality || "0.95"; // tradeoff quality vs size
        var image = new Image(), MAX_HEIGHT = 300, MAX_WIDTH = 450, x = 0, y = 0;
        image.src = sourceImg;
        if (image.width / image.height > MAX_WIDTH / MAX_HEIGHT) {
            image.height = image.height * MAX_WIDTH / image.width;
            image.width = MAX_WIDTH; //canvas.width / img.width 225px to 450 then scale is 2
            y = (MAX_HEIGHT - image.height) / 2;
        }else{
            image.width = image.width * MAX_HEIGHT / image.height; //canvas.width / img.width 225px to 450 then scale is 2
            image.height = MAX_HEIGHT;
            x = (MAX_WIDTH - image.width) / 2;
        }
        var canvas = document.createElement("canvas");
        canvas.width = MAX_WIDTH;
        canvas.height = MAX_HEIGHT;
        var ctx = canvas.getContext("2d"); // get 2D rendering context
        ctx.drawImage(image,x,y, image.width, image.height); // render
        return canvas.toDataURL(type, quality);
    },
    // render the View
    render: function() {
        // set the view element ($el) HTML content using its template
        var self = this;
        this.moviePosterLoad.done(function(markup) {
            self.moviePosterTemplate = _.template(markup);
            self.$el.html(self.moviePosterTemplate());
            $('#detailsImage').attr("src", self.model.get('poster'));
        });
        return this; // support method chaining
    }
});