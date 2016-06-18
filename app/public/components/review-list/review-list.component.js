angular.module('reviewList').component('reviewList', {
    templateUrl: 'components/review-list/review-list.template.html',
    controllerAs: 'vm',
    controller: ['reviewService', 'movieService', '$routeParams', '$location', '$scope',
        function ReviewListController(reviewService, movieService, $routeParams, $location, $scope) {
            var vm = this;
            var eventStream = new EventSource($location.$$url + '/events');

            eventStream.onmessage = function (e) {
                // parses the data from JSON to a model
                var data = JSON.parse(e.data);
                if (data.method == 'POST') {
                    if (vm.movieId == data.model.movieId) {
                        $scope.$apply(function () {
                            vm.reviews.push(new reviewService.Review(data.model));
                            vm.movie.$get();
                        });

                    }
                }
            };

            $scope.$on('$destroy', function iVeBeenDismissed() {
                eventStream.close();
            });
            vm.movieId = $routeParams.movieId;
            vm.movie = movieService.Movie.get({
                    id: vm.movieId
                },
                //success
                function (value, responseHeaders) {

                    // header view updates when signedUp event fires
                },
                //error
                function (httpResponse) {
                    splat.utils.showNotice('Error', "Movie does not exist", 'alert-danger');
                    $location.path('/movies');
                });
            vm.reviews = reviewService.Review.query({movieId: vm.movieId});
            vm.newReview = reviewService.reviewFactory({movieId: vm.movieId});
            splat.reviews = vm.reviews;
            vm.saveReview = function () {

                vm.newReview.$save({},
                    // success
                    function (value, responseHeaders) {
                        splat.utils.showNotice('Success!', 'Movie reviewed', 'alert-success');
                        vm.newReview = reviewService.reviewFactory({movieId: $routeParams.movieId});
                    },
                    //error
                    function (httpResponse) {
                        splat.utils.requestFailed(httpResponse);
                    });

            };
        }
    ]
});
