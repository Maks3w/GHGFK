'use strict';

/* Controllers */

angular.module('GHGFK').
  controller('Alert', ['$scope', function ($scope) {
    $scope.alerts = [];
    $scope.$on('alert.new', function (event, type, msg) {
      $scope.alerts.push({type: type, msg: msg});
    });
    $scope.close = function (index) {
      $scope.alerts.splice(index, 1);
    };
  }]).
  controller('OrgList', ['AuthenticationService', '$scope', 'github.loggedUser',
    function (AuthenticationService, $scope, githubLoggedUserService) {
    var loggedUser = AuthenticationService.getIdentity();

    fetchUserOrganizations()
      .then(function (orgs) {
        orgs.unshift(loggedUser);
        $scope.organizations = orgs;
      })
    ;

    function fetchUserOrganizations() {
      return githubLoggedUserService.getOrganizations();
    }
  }]).
  controller('RepoList', ['AuthenticationService', '$scope', '$routeParams', 'github.loggedUser', 'github.organization',
    function (AuthenticationService, $scope, $routeParams, githubLoggedUserService, githubOrganizationFactory) {
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

      var loggedUser = AuthenticationService.getIdentity();
      if (organization === loggedUser.login) {
        listParams = angular.extend(
          listParams,
          {
            affiliation: 'owner,collaborator',
            direction: 'asc',
            sort: 'full_name'
          }
        );
        promise = githubLoggedUserService.getRepositories(listParams);
      } else {
        listParams = angular.extend(
          listParams,
          {
            type: 'member'
          }
        );
        promise = githubOrganizationFactory(organization).getRepositories(listParams);
      }

      return promise;
    }
  }]).
  controller('PrList', ['$scope', '$routeParams', 'github.repository', function ($scope, $routeParams, githubRepoFactory) {
    var repoFullName = `${$routeParams.organization}/${$routeParams.repo}`;
    $scope.per_page = $routeParams.per_page;
    $scope.currentPage = $routeParams.page;
    $scope.repoFullName = repoFullName;
    githubRepoFactory(repoFullName).getPrs({
      page: $routeParams.page,
      per_page: $routeParams.per_page
    })
      .then(function (prs) {
        $scope.prs = prs;
      });
  }])
;
