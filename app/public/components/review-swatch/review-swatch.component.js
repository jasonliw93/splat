angular.module('reviewSwatch').component('reviewSwatch', {
    templateUrl: 'components/review-swatch/review-swatch.template.html',
    controllerAs: 'vm',
    bindings: {
        movie: "<"
    },
    controller: function ReviewSwatchController() {
        var vm = this;
        vm.getImage = function () {
            if (vm.movie.freshVotes / vm.movie.freshTotal >= 0.5) {
                return '/img/fresh_lg.png'
            } else {
                return '/img/rotten_lg.png'
            }
        };
        vm.getText = function () {
            var score = (vm.movie.freshVotes / vm.movie.freshTotal * 100).toFixed(1);
            return score + '% (' + vm.movie.freshTotal + ')';
        };
    }
});