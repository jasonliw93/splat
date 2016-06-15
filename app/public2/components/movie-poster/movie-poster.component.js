angular.
module('moviePoster').
component('moviePoster', {
    templateUrl: 'components/movie-poster/movie-poster.template.html',
    bindings: {
        movie: "<"
    },
    controllerAs: 'vm',
    controller: ['$scope' , function MoviePosterController($scope) {
        var vm = this;
        vm.imageRead = function(pictureFile) {
          if (pictureFile.type.indexOf('image/') === 0) {

            var reader = new FileReader();
            // callback for when read operation is finished
            reader.onload = function() {
                // resize the image and set the image on callback.
                vm.resize(reader.result, pictureFile.type, '0.9', function(sourceImg) {
                    // set sourceImg as model poster and display image. 
                    $scope.$apply(function() {
                       vm.movie.poster = sourceImg;
                    });
                  splat.utils.showNotice('Note!', 'Movie Poster updated, to make changes permanent, click "Save Changes" button', 'alert-info');
                });
              };

            reader.readAsDataURL(pictureFile); // read image file
          } else { // else display error notification
              splat.utils.showNotice('Error', "Please select a valid image file", 'alert-danger');
          }
        }

        vm.resize = function(sourceImg, type, quality, callback) {
            var type = type || "image/jpeg"; // default MIME image type
            var quality = quality || 0.95; // tradeoff quality vs size
            var image = new Image(),
                MAX_HEIGHT = 255,
                MAX_WIDTH = 450,
                x = 0,
                y = 0;
            image.onload = function() {
                // proportion for img
                if (image.width / image.height > MAX_WIDTH / MAX_HEIGHT) {
                    image.height = image.height * MAX_WIDTH / image.width;
                    image.width = MAX_WIDTH;
                    y = (MAX_HEIGHT - image.height) / 2;
                } else {
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
                ctx.drawImage(image, x, y, image.width, image.height); // render
                if (callback) {
                    callback(canvas.toDataURL("image/jpeg", quality));
                }
            };
            image.src = sourceImg;
        }
    }]
});