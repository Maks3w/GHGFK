/**
 * AngularJS module for GitHub API
 */

angular.module('maks3w.github', ['restangular'])
  .directive('mergeButton', function () {
    return {
      restrict: 'E',
      scope: {
        pr: '=',
        patchType: '&',
        commitMsg: '&',
        selectedBranches: '&'
      },
      controller: ['$scope', 'github.repository', '$rootScope', '$github', function ($scope, repoFactory, $rootScope, $github) {
        var pr = $scope.pr;
        var prOriginalDstBranch = pr.base.ref;

        $scope.commitMsg = 'Merge pull request #' + pr.number;
        $scope.branches = {
          'master': false,
          'develop': false
        };
        $scope.branches[prOriginalDstBranch] = true;
        if (prOriginalDstBranch == 'master') {
          $scope.patchType = 'hotfix';
          $scope.branches['develop'] = true;
        } else if (prOriginalDstBranch == 'develop') {
          $scope.patchType = 'feature';
        }


        $scope.merge = function () {
          var repository = repoFactory(pr.base.repo.full_name);
          repository.getPr(pr.number).then(function (pr) {
            if (!isMergeable(pr)) {
              $rootScope.$broadcast('alert.new', 'err', '#' + pr.number + ' cannot be merged');
              return;
            }

            // Assign the PR to the user for prevent merge by other user
            $github.one('user').get().then(function (user) {
              if (pr.assignee === null) {
                repository.updateIssue(pr.number, {
                  "assignee": user.login
                });
              } else if (pr.assignee.login != user.login) {
                $rootScope.$broadcast('alert.new', 'err', '#' + pr.number + ' cannot be merge while still assigned to ' + pr.assignee.login);
                return;
              }

              var selectedBranches = [];
              var branches = $scope.branches;
              var commitMsg = $scope.commitMsg;
              for (var branch in branches) {
                if (branches.hasOwnProperty(branch) && branches[branch]) {
                  selectedBranches.push(branch);
                }
              }

              if (selectedBranches.length === 1) {
                if (prOriginalDstBranch == 'develop' && prOriginalDstBranch != selectedBranches[0]) {
                  $rootScope.$broadcast('alert.new', 'err', '#' + pr.number + ' cannot be merged against master becaus it is bassed on develop');
                  return; // Prevent merge develop PR against master with all develop history
                }
                _simpleMerge(pr, commitMsg, selectedBranches[0]);
              } else {
                gitFlowMerge(pr, $scope.patchType + '/' + pr.number, commitMsg, 'master', 'develop')
              }
            });
          });
        };

        function isMergeable(pr) {
          return pr.mergeable && !pr.merged;
        }

        function _simpleMerge(pr, commitMsg, dstBranch) {
          console.log('Merging #' + pr.number + ' in ' + dstBranch + ' with commit ' + commitMsg);
          var repository = repoFactory(pr.base.repo.full_name);
          repository.mergeBranch(pr.originalElement.head.sha, dstBranch, commitMsg).then(function () {
            console.log('#' + pr.number + ' merged');
            $rootScope.$broadcast('alert.new', 'info', '#' + pr.number + ' merged');
          });
        }

        function gitFlowMerge(pr, branchName, commitMsg, master, develop) {
          console.log('Merging ' + branchName + ' in ' + [master, develop] + ' with commit ' + commitMsg);
          var repository = repoFactory(pr.base.repo.full_name);
          var b = repository.createBranch(branchName, master).then(function () {
            console.log('Merging #' + pr.number + ' in ' + branchName);
            repository.mergeBranch(pr.originalElement.head.sha, branchName, commitMsg).then(function () {
              repository.mergeBranch(branchName, develop, commitMsg + ' in ' + develop).then(function () {
                console.log(branchName + ' merged in ' + develop);
                $rootScope.$broadcast('alert.new', 'info', branchName + ' merged in ' + develop);

                repository.mergeBranch(branchName, master, commitMsg + ' in ' + master).then(function () {
                  console.log(branchName + ' merged in ' + master);
                  $rootScope.$broadcast('alert.new', 'info', branchName + ' merged in ' + master);

                  console.log('#' + pr.number + ' merged');
                  repository.deleteBranch(branchName);
                });
              });
            });

          });
        }
      }],
      template: '<form ng-model="pr" ng-submit="merge()" name="mergeFrm" novalidate>' +
        '<label>Patch type' +
        '<select ng-model="patchType" required>' +
        '<option value="">Select patch type</option>' +
        '<option value="hotfix">Hotfix</option>' +
        '<option value="feature">Feature</option>' +
        '</select>' +
        '</label>' +
        '<label>Commit msg <input type="text" ng-model="commitMsg" ng-bind="Merge PR #{{pr.number}}" required/></label>' +
        '<div class="control-group"><label ng-repeat="(branch, merge) in branches" class="checkbox inline">' +
        '<input type="checkbox" value="{{ branch }}" ng-model="branches[branch]" ng-checked="merge"/>  {{ branch }}' +
        '</label></div>' +
        '<input type="submit" class="btn btn-danger" value="Merge" ng-disabled="mergeFrm.$invalid"/>' +
        '</form>',
      replace: true,
      transclude: true
    };
  })
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
          newResponse.originalElement = angular.copy(response);
          return newResponse;
        });
      });
    }];
  })
  .factory('github.repository', ['$github', '$q', function ($github, $q) {
    return function (fullName) {
      var repoApi = $github.one('repos', fullName);
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
        }
      };

      return repo;
    };
  }]);
