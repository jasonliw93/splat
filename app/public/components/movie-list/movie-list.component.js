angular.module('movieList').component('movieList', {
    templateUrl: 'components/movie-list/movie-list.template.html',
    controllerAs: 'vm',
    controller: ['movieService', '$scope',
        function MovieListController(movieService, $scope) {
            var vm = this;

            var eventStream = new EventSource('/movies/events');

            eventStream.onmessage = function (e) {
                // parses the data from JSON to a model
                var data = JSON.parse(e.data);
                // only review model has movieId
                var movieId = data.model.movieId ? data.model.movieId : data.model._id;
                if (data.method == 'POST' && !data.model.movieId) { // skip for review
                    vm.movies.push(movieService.Movie.get({
                        id: movieId
                    }));
                } else {
                    for (var i = 0; i < vm.movies.length; i++) {
                        if (vm.movies[i]._id == movieId) {
                            if (data.method == 'DELETE') {
                                $scope.$apply(function () {
                                    vm.movies.splice(i, 1);
                                });
                            } else { //POST for review and PUT for movie
                                vm.movies[i].$get();
                            }
                        }
                    }
                }
            };

            $scope.$on('$destroy', function iVeBeenDismissed() {
                eventStream.close();
            });
            vm.movies = movieService.Movie.query();
        }
    ]
});