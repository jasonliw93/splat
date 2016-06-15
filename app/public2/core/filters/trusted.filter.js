'use strict';

angular.
  module('core', ['core.movie', 'core.review', 'core.user'])
  .filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);