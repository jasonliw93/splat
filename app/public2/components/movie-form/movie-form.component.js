angular.
  module('movieForm').
  component('movieForm', {
    templateUrl: 'components/movie-form/movie-form.template.html',
    bindings: {
      movie: '<'
    },
    controllerAs : 'vm',
    controller: ['$scope', 
      function MovieFormController($scope) {
          var vm = this;
       }
      
  ]});
