// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (MoviePoster) matches name of template file MoviePoster.html
splat.MoviePoster = Backbone.View.extend({
    initialize: function() {
        //this.moviePosterLoad = $.get('tpl/MoviePoster.html');
    },
    events: {
        "change #selectImage": "selectImage",
        "dragover #detailsImage": "dragoverHandler",
        "drop #detailsImage": "dropHandler",
    },
    // handles event when user selects image
    selectImage: function(event) {
        this.pictureFile = event.target.files[0];
        // if the file type is image, read it
        if (this.pictureFile.type.indexOf('image/') == 0) {
            this.imageRead(this.pictureFile, this.pictureFile.type);
        } else { // else display error notification
            splat.utils.showNotice('Error', "Please select a valid image file", 'alert-danger');
        }
    },
    // Read pictureFile from filesystem, resulting in
    // DataURL (base64 representation of image data).
    // Use as model poster attrib. and image src attrib.
    imageRead: function(pictureFile, type) {
        var self = this;
        var reader = new FileReader();
        // callback for when read operation is finished
        reader.onload = function(event) {
            // resize the image and set the image on callback.
            self.resize(reader.result, undefined, undefined, self.setImage);
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
    // handles event when user drags and drops a picture file
    dropHandler: function(event) {
        event.currentTarget.className = '';
        event.stopPropagation();
        event.preventDefault();
        var ev = event.originalEvent;
        this.pictureFile = ev.dataTransfer.files[0];
        // only process image files
        if (this.pictureFile.type.indexOf('image/') == 0) {
            this.imageRead(this.pictureFile, this.pictureFile.type);
        } else { // else display notification error
            splat.utils.showNotice('Error', "Please select a valid image file", 'alert-danger');
        }
    },
    // Resize sourceImg and call callback function on resized sourceImg when complete. 
    // Type, quality are optional params for image-type and quality setting
    resize: function(sourceImg, type, quality, callback) {
        var self = this;
        var type = type || "image/jpeg"; // default MIME image type
        var quality = quality || 0.95; // tradeoff quality vs size
        var image = new Image(), MAX_HEIGHT = 300, MAX_WIDTH = 450, x = 0, y = 0;
        image.onload = function() {
            // proportion for img
            if (image.width / image.height > MAX_WIDTH / MAX_HEIGHT) {
                image.height = image.height * MAX_WIDTH / image.width;
                image.width = MAX_WIDTH; 
                y = (MAX_HEIGHT - image.height) / 2;
            }else{
                image.width = image.width * MAX_HEIGHT / image.height;
                image.height = MAX_HEIGHT;
                x = (MAX_WIDTH - image.width) / 2;
            }
            //creates a new "canvas" object
            var canvas = document.createElement("canvas");
            canvas.width = MAX_WIDTH;
            canvas.height = MAX_HEIGHT;
            // ctx becomes an object with properties and methods for drawing on canvas
            var ctx = canvas.getContext("2d"); // get 2D rendering context
            ctx.drawImage(image,x,y, image.width, image.height); // render
            callback.call(self, canvas.toDataURL(type, quality), type);
        }
        image.src = sourceImg;
    },
    // set sourceImg as model poster and display image. 
    setImage: function(sourceImg, type){
        this.model.set('poster', '/img/failedupload.png');
        var targetImgElt = $('#detailsImage')[0];
        targetImgElt.src = sourceImg;
        var blobBin = atob(sourceImg.split(',')[1]);
        var array = [];
        for(var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }
        splat.imageFile = new Blob([new Uint8Array(array)], {type: type});
        splat.utils.showNotice('Note!', 'Movie Poster updated, to make changes permanent, click "Save Changes" button', 'alert-info');
    },
    // render the View
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this; // support method chaining
    }
});
