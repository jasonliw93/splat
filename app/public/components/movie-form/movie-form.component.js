angular.module('movieForm').component('movieForm', {
    templateUrl: 'components/movie-form/movie-form.template.html',
    bindings: {
        movie: '<'
    },
    controllerAs: 'vm',
    controller: function MovieFormController() {
        var vm = this;
        vm.titleRegex = /^[a-zA-Z0-9 \,\.\!\?\-\'\*]+$/;
        vm.releasedRegex = /^(19[1-9]\d|20(1[0-6]|0\d))$/; //1910-2016
        vm.directorRegex = /^[a-zA-Z0-9 \,\.\!\?\-\'\*]+$/;
        vm.ratingRegex = /^(G|PG|PG\-13|R|NC\-17|NR)$/;
    }

});
