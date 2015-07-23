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
      $location.path("/repo");
    };
  }).
  controller('OrgList', function ($scope, $github) {
    fetchUserOrganizations()
      .then(function (orgs) {
        orgs.unshift({login: 'My own repositories'});
        $scope.organizations = orgs;
      })
    ;

    function fetchUserOrganizations() {
      return $github.all('user').all('orgs').getList();
    }
  }).
  controller('RepoList', function ($scope, $routeParams, $github) {
    fetchRepositories($routeParams.organization)
      .then(function (repositories) {
        $scope.repositories = repositories;
      })
    ;

    function fetchRepositories(organization) {
      var promise;
      var listParams = {
        per_page: 200
      };

      if (organization == 'My own repositories') {
        listParams = angular.extend(
          listParams,
          {
            affiliation: 'owner,collaborator',
            direction: 'asc',
            sort: 'full_name'
          }
        );
        promise = $github.all('user').all('repos').getList(listParams);
      } else {
        listParams = angular.extend(
          listParams,
          {
            type: 'member'
          }
        );
        promise = $github.all('orgs').all(organization).all('repos').getList(listParams);
      }

      return promise;
    }
  }).
  controller('PrList', function ($scope, $routeParams, $github) {
    var repoFullName = $routeParams.organization + '/' + $routeParams.repo;
    $scope.per_page = $routeParams.per_page;
    $scope.currentPage = $routeParams.page;
    $scope.repoFullName = repoFullName;
    $github.all('repos/' + repoFullName).all('pulls').getList({
      page: $routeParams.page,
      per_page: $routeParams.per_page
    })
      .then(function (prs) {
        $scope.prs = prs;
      });
  })
;
