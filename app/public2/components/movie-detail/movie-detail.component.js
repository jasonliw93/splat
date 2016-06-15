angular.
module('movieDetail').
component('movieDetail', {
    templateUrl: 'components/movie-detail/movie-detail.template.html',
    controllerAs: 'vm',
    controller: ['movieService', '$routeParams', '$location',
        function MovieDetailController(movieService, $routeParams, $location) {
            var vm = this;
            if ($routeParams.id == "add") {
                vm.movie = movieService.movieFactory();
                splat.movie = vm.movie;
            } else {

                vm.movie = movieService.Movie.get({
                        id: $routeParams.id
                    },
                    //success
                    function(value, responseHeaders) {
                        splat.movie = vm.movie;
                        // header view updates when signedUp event fires
                    },
                    //error
                    function(httpResponse) {
                        splat.utils.showNotice('Error', "Movie does not exist", 'alert-danger');
                        $location.path('/movies');
                    });
            }  
            splat.movie = vm.movie;

            vm.save = function() {
                if (!vm.movie._id) {
                    vm.movie.$save({},
                        // success
                        function(value, responseHeaders) {
                            $location.path("/movies/" + value._id, false);
                            splat.utils.showNotice('Success!', 'Movie saved', 'alert-success');
                        },
                        //error
                        function(httpResponse) {
                            splat.utils.requestFailed(httpResponse);
                        });
                } else {
                    vm.movie.$update({},
                        // success
                        function(value, responseHeaders) {
                            splat.utils.showNotice('Success!', 'Movie updated', 'alert-success');
                        },
                        //error
                        function(httpResponse) {
                            splat.utils.requestFailed(httpResponse);
                        });
                }
            };

            vm.delete = function() {
                vm.movie.$delete({},
                    // success
                    function(value, responseHeaders) {
                        $location.path('/movies');
                        // notification panel, defined in section 2.6
                        splat.utils.showNotice('Success', "Movie deleted", 'alert-success');
                        // header view updates when signedUp event fires
                    },
                    //error
                    function(httpResponse) {
                        splat.utils.requestFailed(httpResponse);
                    });
            }
        }
    ]
});