/**
 * AngularJS module for GitHub API
 */

angular.module('maks3w.github', ['ng'])
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
  .factory('$github', ['$githubConfigurator', '$http', function (config, $http) {
    var configurator = config;
    function makeRequest(method, uri, data) {
      var headers = {
        Accept: 'application/vnd.github.raw',
        Authorization: 'token ' + configurator.token
      };

      method = method.toLowerCase();

      var config = {
        method: method,
        url: configurator.apiUrl + uri,
        headers: headers
      };

      switch (method) {
        case "get":
          config.params = data;
          break;
        case "patch":
        case "post":
        case "put":
          config.data = data;
          break;
      }

      return $http(config)
        .then(function (response) {
          return response.data;
        }
      );
    }

    return {
      get: function (uri, params) {
        return makeRequest('get', uri, params);
      },
      patch: function (uri, data) {
        return makeRequest('patch', uri, data);
      },
      post: function (uri, data) {
        return makeRequest('post', uri, data);
      },
      put: function (uri, data) {
        return makeRequest('put', uri, data);
      },
      delete: function (uri) {
        return makeRequest('delete', uri);
      }
    };
  }])
  .service('github.loggedUser', ['$github', function ($github) {
    var userApi = '/user';
    var user = {
      getUser: function () {
        return $github.get(userApi);
      },
      getOrganizations: function (params) {
        return $github.get(userApi + '/orgs', params);
      },
      getRepositories: function (params) {
        return $github.get(userApi + '/repos', params);
      }
    };

    return user;
  }])
  .factory('github.organization', ['$github', function ($github) {
    return function (organization) {
      var orgApi = '/orgs/' + organization;
      var org = {
        getRepositories: function (params) {
          return $github.get(orgApi + '/repos', params);
        }
      };

      return org;
    };
  }])
  .factory('github.repository', ['$github', function ($github) {
    return function (fullName) {
      var repoApi = '/repos/' + fullName;
      var refApi = repoApi + '/git/refs';
      var repo = {
        createBranch: function (branchName, branchSource) {
          console.log('Making ' + branchName + ' based in ' + branchSource);
          return repo.getBranch(branchSource)
            .then(
            function (data) {
              promise.resolve($github.post(refApi, {
                "ref": 'refs/heads/' + branchName,
                "sha": data.object.sha
              }));
            }
          );
        },
        getBranch: function (branch) {
          return $github.get(refApi + '/heads/', branch);
        },
        deleteBranch: function (branch) {
          console.log('Removing ' + branch);
          return $github.delete(refApi + '/heads/', branch);
        },
        mergeBranch: function (head, base, commit) {
          console.log('Merging ' + head + ' in ' + base);
          return $github.post(repoApi + '/merges', {
            "base": base,
            "head": head,
            "commit_message": commit
          });
        },
        getPr: function (number) {
          return $github.get(repoApi + '/pulls', number);
        },
        getPrs: function (params) {
          return $github.get(repoApi + '/pulls', params);
        },
        getIssue: function (number) {
          return $github.get(repoApi + '/issues', number);
        },
        updateIssue: function (number, args) {
          return $github.patch(repoApi + '/issues/' + number, args);
        },
        getMilestones: function () {
          return $github.get(repoApi + '/milestones');
        }
      };

      return repo;
    };
  }]);
