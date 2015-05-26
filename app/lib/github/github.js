/**
 * AngularJS module for GitHub API
 */

angular.module('maks3w.github', ['restangular'])
  .provider('$githubConfigurator', function () {
    var apiUrl = 'https://api.github.com';
    var token;

    this.$get = function () {
      return {
        apiUrl: apiUrl,
        token: token
      }
    }
  })
  .provider('$github', function () {

    this.$get = ['$githubConfigurator', 'Restangular', '$rootScope', function (config, Restangular, $rootScope) {
      return Restangular.withConfig(function (RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl(config.apiUrl);
        RestangularConfigurer.setDefaultHeaders({
          Accept: 'application/vnd.github.raw',
          'Content-Type': 'application/json',
          Authorization: 'token ' + config.token
        });
        RestangularConfigurer.setDefaultRequestParams({
          per_page: 100
        });
        RestangularConfigurer.setErrorInterceptor(function (response) {
          // TODO decouple this
          $rootScope.$broadcast('alert.new', 'error', response.data.message);
        });
        RestangularConfigurer.setResponseExtractor(function (response) { // workaround to field conflict pr.head with restangular http method head
          var newResponse = response;
          if (angular.isArray(response)) {
            angular.forEach(newResponse, function(value, key) {
              newResponse[key].originalElement = angular.copy(value);
            });
          } else {
            newResponse.originalElement = angular.copy(response);
          }

          return newResponse;
        });
      });
    }];
  })
  .factory('github.repository', ['$github', '$q', function ($github, $q) {
    return function (fullName) {
      var repoApi = $github.all('repos/' + fullName);
      var refApi = repoApi.all('git').all('refs');
      var repo = {
        createBranch: function (branchName, branchSource) {
          console.log('Making ' + branchName + ' based in ' + branchSource);
          var promise = $q.defer();
          // FIXME return promise
          repo.getBranch(branchSource).then(
            function (data) {
              promise.resolve(refApi.post({
                "ref": 'refs/heads/' + branchName,
                "sha": data.object.sha
              }));
            },
            function (response) {
              promise.reject(response);
            }
          );

          return promise.promise;
        },
        getBranch: function (branch) {
          return refApi.one('heads', branch).get();
        },
        deleteBranch: function (branch) {
          console.log('Removing ' + branch);
          return refApi.one('heads', branch).remove();
        },
        mergeBranch: function (head, base, commit) {
          console.log('Merging ' + head + ' in ' + base);
          return repoApi.all('merges').post({
            "base": base,
            "head": head,
            "commit_message": commit
          });
        },
        getPr: function (number) {
          return repoApi.one('pulls', number).get();
        },
        getIssue: function (number) {
          return repoApi.one('issues', number).get();
        },
        updateIssue: function (number, args) {
          return repoApi.one('issues', number).patch(args);
        },
        getMilestones: function () {
          return repoApi.all('milestones').getList();
        }
      };

      return repo;
    };
  }]);
