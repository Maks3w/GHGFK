'use strict';

// Declare app level module which depends on filters, and services
angular.module('GHGFK', ['maks3w.github', 'maks3w.github.directives', 'ui.bootstrap', 'ngRoute']).
  config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {redirectTo : '/repo'});
    $routeProvider.when('/auto_login', {templateUrl: 'partials/autoLogin.html', controller: 'AutoLoginController'});
    $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginController'});
    $routeProvider.when('/repo', {templateUrl: 'partials/orgList.html', controller: 'OrgList'});
    $routeProvider.when('/repo/:organization', {templateUrl: 'partials/repoList.html', controller: 'RepoList'});
    $routeProvider.when('/repo/:organization/:repo', {templateUrl: 'partials/prList.html', controller: 'PrList'});
    $routeProvider.when('/repo/:organization/:repo/page/:page/per_page/:per_page', {templateUrl: 'partials/prList.html', controller: 'PrList'});
    $routeProvider.otherwise({redirectTo: '/'});
  }])
  .run(['$rootScope', 'AuthenticationService', '$location', function ($rootScope, AuthenticationService, $location) {
    $rootScope.$on('$locationChangeStart', function () {
      // redirect to login page if not logged in and trying to access a restricted page
      var restrictedPage = (['/login', '/auto_login'].indexOf($location.path()) === -1);
      var loggedIn = AuthenticationService.isLogged();
      if (restrictedPage && !loggedIn) {
        $location.path('/auto_login');
      }
    });
  }])
;
