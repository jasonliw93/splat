angular.module('movieThumb').component('movieThumb', {
    templateUrl: 'components/movie-thumb/movie-thumb.template.html',
    controllerAs: 'vm',
    bindings: {
        movie: "<"
    }
});