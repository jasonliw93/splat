angular.
  module('register').
  component('register', {
    templateUrl: 'components/register/register.template.html',
    bindings: {
      user: '<'
    },
    controllerAs: 'vm',
    controller: ['User',
      function RegisterController(User) {
      	var vm = this;

      	vm.register = function() {
			    vm.user.$save({}, 
      			// success
      			function(value, responseHeaders){
      				  vm.user.authenticated = true;
                splat.utils.showNotice('Signup Successful!',
                    'Welcome ' + splat.username, 'alert-success');
      			},
        		//error
        		function(httpResponse){
              splat.utils.showNotice('Signup Failed',
                'Failed to create account', 'alert-danger');
        		});
      }
  }]});
