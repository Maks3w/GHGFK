'use strict';

// Declare app level module which depends on filters, and services
angular.module('GHGFK', ['GHGFK.controllers', 'maks3w.github', 'maks3w.github.directives', 'ui.bootstrap', 'ngRoute']).
  config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'Login'});
    $routeProvider.when('/repo', {templateUrl: 'partials/orgList.html', controller: 'OrgList'});
    $routeProvider.when('/repo/:organization', {templateUrl: 'partials/repoList.html', controller: 'RepoList'});
    $routeProvider.when('/repo/:organization/:repo', {templateUrl: 'partials/prList.html', controller: 'PrList'});
    $routeProvider.when('/repo/:organization/:repo/page/:page/per_page/:per_page', {templateUrl: 'partials/prList.html', controller: 'PrList'});
    $routeProvider.otherwise({redirectTo: '/login'});
  }])
;
angular.module('maks3w.github').
  run(['$githubConfigurator', function (config) {
    config.token = localStorage.githubToken;
  }])
;
