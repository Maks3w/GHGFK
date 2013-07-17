/**
 * AngularJS module with GitHub buttons
 */

angular.module('maks3w.github.directives', ['maks3w.github'])
  .directive('ghBranchCreateMenu', function () {
    return {
      restrict: 'E',
      scope: {
        repo: '=repo',
        bases: '=bases',
        branchName: '=name'
      },
      template: '<div class="btn-group">' +
        '<button class="btn btn-warning gh-branch-create" tabindex="-1" name="{{branchName}}" base="{{ bases[0] }}" repo="{{ repo }}" title="Create branch {{ branchName }} from {{ bases[0] }}">' +
        '<span class="type-icon octicon octicon-git-branch-create"></span>' +
        ' {{ branchName }}' +
        '</button>' +
        '<button class="btn btn-warning dropdown-toggle" data-toggle="dropdown" tabindex="-1">' +
        '<span class="caret"></span>' +
        '</button>' +
        '<ul class="dropdown-menu">' +
        '<li ng-repeat="base in bases">' +
        '<a class="gh-branch-create" name="{{ branchName }}" base="{{ base }}" repo="{{ repo }}" title="Create branch {{ branchName }} from {{ base }}">' +
        '{{ base }}' +
        '</a>' +
        '</li>' +
        '</ul>' +
        '</div>',
      replace: true
    }
  })
  .directive('ghMergeMenu', function () {
    return {
      restrict: 'E',
      scope: {
        repo: '=repo',
        bases: '=bases',
        head: '=head',
        msg: '=msg'
      },
      template: '<div class="btn-group">' +
        '<button class="btn btn-warning gh-merge" tabindex="-1" head="{{head}}" base="{{ bases[0] }}" repo="{{ repo }}" msg="{{ msg }} into {{ bases[0] }}" title="Merge {{ head }} into {{ bases[0] }}">' +
        '<span class="type-icon octicon octicon-git-merge"></span>' +
        ' {{ head }} in {{ bases[0] }}' +
        '</button>' +
        '<button class="btn btn-warning dropdown-toggle" data-toggle="dropdown" tabindex="-1">' +
        '<span class="caret"></span>' +
        '</button>' +
        '<ul class="dropdown-menu">' +
        '<li ng-repeat="base in bases">' +
        '<a class="gh-merge" head="{{ head }}" base="{{ base }}" repo="{{ repo }}" msg="{{ msg }} into {{ base }}" title="Merge {{ head }} into {{ base }}">' +
        '{{ base }}' +
        '</a>' +
        '</li>' +
        '</ul>' +
        '</div>',
      replace: true
    }
  })
  .directive('ghBranchCreate', function () {
    return {
      restrict: 'AC',
      controller: ['$scope', 'github.repository', function ($scope, repoFactory) {
        $scope.createBranch = function (repoFullName, branchName, base) {
          return repoFactory(repoFullName).createBranch(branchName, base);
        }
      }],
      link: function (scope, element, attrs) {
        element.bind('click', function () {
          scope.createBranch(attrs.repo, attrs.name, attrs.base);
        });
      }
    }
  })
  .directive('ghBranchDelete', function () {
    return {
      restrict: 'AC',
      controller: ['$scope', 'github.repository', function ($scope, repoFactory) {
        $scope.deleteBranch = function (repoFullName, branchName) {
          return repoFactory(repoFullName).deleteBranch(branchName);
        }
      }],
      link: function (scope, element, attrs) {
        element.bind('click', function () {
          scope.deleteBranch(attrs.repo, attrs.name);
        });
      }
    }
  })
  .directive('ghMerge', function () {
    return {
      restrict: 'AC',
      controller: ['$scope', 'github.repository', function ($scope, repoFactory) {
        $scope.mergePr = function (repo, base, head, msg) {
          return repoFactory(repo).mergeBranch(head, base, msg);
        }
      }],
      link: function (scope, element, attrs) {
        element.bind('click', function () {
          scope.mergePr(attrs.repo, attrs.base, attrs.head, attrs.msg);
        });
      }
    }
  })
  .directive('mergeButton', function () {
    return {
      restrict: 'E',
      scope: {
        pr: '=',
        patchType: '&',
        commitMsg: '&',
        selectedBranches: '&',
        localPrBranch: '&'
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

        $scope.$watch('patchType', function () {
          $scope.localPrBranch = $scope.patchType + '/' + pr.number;
        });

        $scope.filterSelectedBranches = function () {
          var keys = [];
          for (var k in $scope.branches) {
            if ($scope.branches.hasOwnProperty(k) && $scope.branches[k]) {
              keys.push(k);
            }
          }
          $scope.selectedBranches = keys;
        };
        $scope.filterSelectedBranches();

        $scope.merge = function () {
          var repository = repoFactory(pr.base.repo.full_name);
          repository.getPr(pr.number).then(function (pr) {
            if (!isMergeable(pr)) {
              $rootScope.$broadcast('alert.new', 'error', '#' + pr.number + ' cannot be merged');
              return;
            }

            // Assign the PR to the user for prevent merge by other user
            $github.one('user').get().then(function (user) {
              if (pr.assignee === null) {
                repository.updateIssue(pr.number, {
                  "assignee": user.login
                });
              } else if (pr.assignee.login != user.login) {
                $rootScope.$broadcast('alert.new', 'error', '#' + pr.number + ' cannot be merge while still assigned to ' + pr.assignee.login);
                return;
              }

              var commitMsg = $scope.commitMsg;
              var selectedBranches = $scope.selectedBranches;

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
          repository.createBranch(branchName, master).then(function () {
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
      template: '<div><form ng-model="pr" ng-submit="merge()" name="mergeFrm" novalidate ng-init="isCollapsed = true">' +
        '<label>Patch type' +
        '<select ng-model="patchType" required>' +
        '<option value="">Select patch type</option>' +
        '<option value="hotfix">Hotfix</option>' +
        '<option value="feature">Feature</option>' +
        '</select>' +
        '</label>' +
        '<label>Commit msg <input type="text" ng-model="commitMsg" ng-bind="Merge PR #{{pr.number}}" required/></label>' +
        '<div class="control-group"><label ng-repeat="(branch, merge) in branches" class="checkbox inline">' +
        '<input type="checkbox" value="{{ branch }}" ng-model="branches[branch]" ng-checked="merge" ng-change="filterSelectedBranches()" />  {{ branch }}' +
        '</label></div>' +
        '<input type="submit" class="btn btn-danger" value="Merge" ng-disabled="mergeFrm.$invalid"/>' +
        '<a class="btn" ng-click="isCollapsed = !isCollapsed">' +
        '<span class="type-icon octicon" ng-class="{ true:\'octicon-chevron-down\', false:\'octicon-chevron-up\' }[isCollapsed]"></span>' +
        'Step by step' +
        '<span class="type-icon octicon" ng-class="{ true:\'octicon-chevron-down\', false:\'octicon-chevron-up\' }[isCollapsed]"></span>' +
        '</a>' +
        '</form>' +
        '<div ng-hide="isCollapsed">' +
        // create branch buttons
        '<gh-branch-create-menu bases="selectedBranches" name="localPrBranch" repo="pr.base.repo.full_name"></gh-branch-create-menu>' +
        // merge PR in local branch button
        '<button class="btn btn-warning gh-merge" repo="{{pr.base.repo.full_name}}" base="{{localPrBranch}}" head="{{pr.originalElement.head.sha}}" msg="{{ commitMsg }}" title="Merge PR #{{ pr.number }} in {{ localPrBranch }} with message {{ commitMsg }}">' +
        '<span class="type-icon octicon octicon-git-merge"></span>' +
        ' #{{ pr.number }} in {{ localPrBranch }}' +
        '</button>' +
        '<a class="btn" href="{{ pr.base.repo.html_url }}/tree/{{ localPrBranch  }}" target="_blank">Browse files and edit</a>' +
        // Merge PR in final branches button
        '<gh-merge-menu bases="selectedBranches" head="localPrBranch" repo="pr.base.repo.full_name" msg="commitMsg"></gh-merge-menu>' +
        // delete local branch button
        '<button class="btn btn-danger gh-branch-delete" repo="{{pr.base.repo.full_name}}" name="{{localPrBranch}}" title="Delete {{ localPrBranch }}">' +
        '<span class="type-icon octicon octicon-git-branch-delete"></span>' +
        ' {{ localPrBranch }}' +
        '</button>' +
        '</div>' +
        '</div>',
      replace: true
    };
  });
