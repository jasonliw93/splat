angular.
  module('login').
  component('login', {
    templateUrl: 'components/login/login.template.html',
    controllerAs: 'vm',
    bindings: {
      user : "<"
    },
    controller: ['User',
      function LoginController(User) {
		    var vm = this;
        vm.$onInit = function() {
          console.log(vm);
        };
      	vm.signin = function() {
      		//console.log(splat.user);
          vm.user.login = 1;
			    vm.user.$update({}, 
      			// success
      			function(value, responseHeaders){
      				//splat.userid = value.userid;
              vm.user.authenticated = true;
              splat.utils.showNotice('Signin Successful!',
                  'Welcome back ' + vm.username, 'alert-success');
              // header view updates when signedUp event fires
      			},
        		//error
        		function(httpResponse){
        			splat.utils.showNotice('Signin Failed',
                        httpResponse.data, 'alert-danger');
          });
        	
      	};
        vm.signout = function() {
          vm.user.login = 0;
          vm.user.$update({}, 
            // success
            function(value, responseHeaders){
              vm.user.authenticated = false;
              vm.user.username = '';
              vm.user.password = '';
              splat.utils.showNotice('Signout Successful!',
                'Please Come Back Soon', 'alert-success');
              // header view updates when signedUp event fires
            },
            //error
            function(httpResponse){
                splat.utils.showNotice('Error', err.responseText, 'alert-danger');
          });
        };
      }
    ]
  });
