angular.module('splatApp').config(['$locationProvider', '$routeProvider', '$httpProvider',
    function config($locationProvider, $routeProvider, $httpProvider) {
        $httpProvider.defaults.headers.common['X-CSRF-Token'] = splat.token;
        $locationProvider.hashPrefix('!');
        $routeProvider.when('/home', {
            templateUrl: "home.html"
        }).when('/about', {
            templateUrl: "about.html"
        }).when('/movies', {
            template: "<movie-list><movie-list/>"
        }).when('/movies/:id', {
            template: "<movie-detail></movie-detail>"
        }).when('/movies/:movieId/reviews', {
            template: "<review-list></review-list>"
        }).otherwise('/home');
    }
]);
