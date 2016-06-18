angular.
  module('core.review').
  factory('reviewService', ['$resource',
    function($resource) {
      	var Review = $resource('/movies/:movieId/reviews', 
      	{
            movieId: '@movieId'
        }, 
        {
            //'get':    {method:'GET'},
            'save':   {method:'POST'},
            'query':  {method:'GET', isArray:true},
            //'remove': {method:'DELETE'},
            //'delete': {method:'DELETE'},
            //'update': {method:'PUT'} 
        });

		var reviewFactory = function(options) {
		    var defaults = {
			    freshness: 0.0,
			    reviewName: "",
			    reviewAffil: "",
			    reviewText: "",
			    movieId: undefined,
			};
		    options = angular.extend(defaults, options || {});
		    return new Review(options);
		}

		return {
		    Review: Review,
		    reviewFactory: reviewFactory
		}
    }

  ]);