/**
 * AngularJS module with GitHub buttons
 */

angular.module('maks3w.github.directives', ['maks3w.github'])
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
                  $rootScope.$broadcast('alert.new', 'err', '#' + pr.number + ' cannot be merged against master because it is based on develop');
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
  });
