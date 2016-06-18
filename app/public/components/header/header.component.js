angular.module('header').component('header', {
    templateUrl: 'components/header/header.template.html',
    controllerAs: 'vm',
    controller: ['User', function HeaderController(User) {
        var vm = this;
        vm.user = new User({username: splat.username, authenticated: splat.auth});
        //splat.user = vm.user;
        vm.$onInit = function () {
            vm.user.authenticated = splat.auth;
        };
    }

    ]
});
