angular.
  module('core.user').
  factory('User', ['$resource',
    function($resource) {
      	return $resource('/auth', {}, { 
	      	//'get':    {method:'GET'},
	  		'save':   {method:'POST'},
	  		//'query':  {method:'GET', isArray:true},
	  		//'remove': {method:'DELETE'},
	  		//'delete': {method:'DELETE'},
	  		'update': {method:'PUT'} 
  		});
    }
  ]);
