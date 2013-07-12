'use strict';

// Declare app level module which depends on filters, and services
angular.module('GHGFK', ['GHGFK.controllers', 'maks3w.github', 'ui.bootstrap']).
  config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'Login'});
    $routeProvider.when('/selectRepo', {templateUrl: 'partials/selectRepository.html', controller: 'SelectRepository'});
    $routeProvider.when('/repo/:repo', {templateUrl: 'partials/prList.html', controller: 'PrList'});
    $routeProvider.when('/repo/:repo/page/:page/per_page/:per_page', {templateUrl: 'partials/prList.html', controller: 'PrList'});
    $routeProvider.otherwise({redirectTo: '/login'});
  }])
;
angular.module('maks3w.github').
  run(['$githubConfigurator', function (config) {
    config.token = localStorage.githubToken;
  }])
;
