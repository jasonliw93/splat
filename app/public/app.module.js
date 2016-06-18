'use strict';

// Define the `phonecatApp` module
angular.module('splatApp', [
    // ...which depends on the `phoneList` module
    'core',
    'ngRoute',
    'header',
    'movieList',
    'movieDetail',
    'reviewList',
]);
