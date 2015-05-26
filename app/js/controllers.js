'use strict';

/* Controllers */

angular.module('GHGFK.controllers', []).
  controller('Alert', ['$scope', function ($scope) {
    $scope.alerts = [];
    $scope.$on('alert.new', function (event, type, msg) {
      $scope.alerts.push({type: type, msg: msg});
    });
    $scope.close = function (index) {
      $scope.alerts.splice(index, 1);
    };
  }]).
  controller('Login',function ($scope, $location, $rootScope, $githubConfigurator) {
    $scope.github_token = localStorage.githubToken;

    $scope.login = function () {
      $githubConfigurator.token = $scope.github_token;
      localStorage.githubToken = $scope.github_token;
      $location.path("/selectRepo");
    };
  }).
  controller('SelectRepository',function ($scope, $location, $github) {
    fillOrganizations();
    $scope.fillRepositories = fillRepositories;
    $scope.showPRs = function () {
      $location.path("/repo/" + encodeURIComponent($scope.repository.full_name) + '/page/1/per_page/20');
    };

    function fillOrganizations() {
      $github.all('user').all('orgs').getList().then(function (orgs) {
        orgs.unshift({login: 'My own repositories'});
        $scope.organizations = orgs;
      });
    }

    function fillRepositories(organization) {
      var promise;

      if (organization.login == 'My own repositories') {
        promise = $github.all('user').all('repos').getList();
      } else {
        promise = $github.allUrl('repos', organization.repos_url).getList();
      }

      promise.then(function (repositories) {
        $scope.repositories = repositories;
      });
    }
  }).
  controller('PrList', function ($scope, $routeParams, $github) {
    var repoFullName = decodeURIComponent($routeParams.repo);
    $scope.per_page = $routeParams.per_page;
    $scope.currentPage = $routeParams.page;
    $scope.repo = encodeURIComponent($routeParams.repo);
    $github.all('repos/' + repoFullName).all('pulls').getList({
      page: $routeParams.page,
      per_page: $routeParams.per_page
    })
      .then(function (prs) {
        $scope.prs = prs;
      });
  })
;
