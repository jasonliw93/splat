angular.
module('core.movie').
factory('movieService', ['$resource',
    function($resource) {
        var Movie = $resource('/movies/:id', {
            id: '@_id'
        }, {
            'get':    {method:'GET'},
            'save':   {method:'POST'},
            'query':  {method:'GET', isArray:true},
            'remove': {method:'DELETE'},
            'delete': {method:'DELETE'},
            'update': {method:'PUT'} 
        });
        var movieFactory = function(options) {
            var defaults = {
                title: "", // movie title    
                released: "", // release year
                director: "", // movie's director
                rating: "", // MPAA movie rating: G, PG, PG-13, R, NC-17, NR
                starring: [], // array principal actors
                duration: undefined, // run-time in minutes
                genre: [], // genre terms, e.g. action, comedy, etc
                synopsis: "", // brief outline of the movie
                freshTotal: 0.0, // cumulative total of review fresh (1.0) votes
                freshVotes: 0.0, // number of review ratings
                trailer: "", // URL for trailer/movie-streaming
                poster: "img/placeholder.png", // movie-poster image URL
                dated: new Date(), // date of movie created
                userId: undefined,
            };
            options = angular.extend(defaults, options || {});
            return new Movie(options);
        }

        return {
            Movie: Movie,
            movieFactory: movieFactory
        }
    }
]);