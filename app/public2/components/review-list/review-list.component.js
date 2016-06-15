angular.
  module('reviewList').

  component('reviewList', {
    templateUrl: 'components/review-list/review-list.template.html',
    controllerAs : 'vm',
    controller: ['reviewService', '$routeParams', '$location', '$scope',
      function ReviewListController(reviewService, $routeParams, $location, $scope) {
          var vm = this;
          console.log($location);
          var eventStream = new EventSource($location.$$url + '/events');

            eventStream.onmessage = function(e) {
                // parses the data from JSON to a model
                var data = JSON.parse(e.data);
                if (data.method == 'POST') {
                    if (vm.movieId == data.model.movieId){
                      $scope.$apply(function() {
                          vm.reviews.push(new reviewService.Review(data.model));
                      });
                        
                    }
                } 
            };

          $scope.$on('$destroy', function iVeBeenDismissed() {
              eventStream.close();
          })
          vm.movieId = $routeParams.movieId;
          vm.reviews = reviewService.Review.query({movieId : vm.movieId});
          vm.newReview = reviewService.reviewFactory({movieId : vm.movieId});
          splat.reviews = vm.reviews;
          vm.saveReview = function() {
                
            vm.newReview.$save({},
                // success
                function(value, responseHeaders) {
                    splat.utils.showNotice('Success!', 'Movie reviewed', 'alert-success');
                    vm.newReview = reviewService.reviewFactory({movieId : $routeParams.movieId});
                },
                //error
                function(httpResponse) {
                    splat.utils.requestFailed(httpResponse);
                });
                
            };
        }
      ]
  });
