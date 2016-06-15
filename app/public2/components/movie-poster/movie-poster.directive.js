angular
    .module("moviePoster")
    .directive('selectImage', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                element.on('change', function(event) {
                    // Prevent default dragging of selected content
                    var pictureFile = event.target.files[0];
                    scope.vm.imageRead(pictureFile);
                });

                
            }
        }
    }).directive('dragAndDropImage', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                element.on('dragover', function(event) {

                    // Prevent default dragging of selected content
                    event.stopPropagation();
                    // prevent default to enable drop event
                    event.preventDefault();
                    // jQuery event doesn’t have dataTransfer
                    // field - so use originalEvent
                    //event.dataTransfer.dropEffect = 'copy';
                });
                element.on('drop', function(event) {
                    event.stopPropagation();
                    event.preventDefault();
                    var pictureFile = event.dataTransfer.files[0];
                    // if the file type is image, read it
                    scope.vm.imageRead(pictureFile);
                    
                });                
            }
        }
    });