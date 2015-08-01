///<reference path="../../../../typings/tsd.d.ts"/>

import {GitFlowService} from "../GitFlowService";

export class MergeButtonFactory {
    static create(gitFlow:GitFlowService):MergeButton {
        return new MergeButton(gitFlow);
    }
}

export class MergeButton implements ng.IDirective {
    public restrict:string = "E";
    public scope:{} = {
        pr: "=",
        patchType: "&",
        commitMsg: "&",
        selectedBranches: "&",
        temporalBranch: "&"
    };
    public template:string = `
        <div>
          <form ng-model="pr" ng-submit="merge()" name="mergeFrm" novalidate ng-init="isCollapsed = true">
            <label>
              Patch type
              <select ng-model="patchType" required>
                <option value="">Select patch type</option>
                <option value="hotfix">Hotfix</option>
                <option value="feature">Feature</option>
              </select>
            </label>
            <label>
              Commit msg
              <input type="text" ng-model="commitMsg" ng-bind-template="Merge PR #{{pr.number}}" required/>
            </label>
            <div class="control-group">
              <label ng-repeat="(branch, merge) in branches" class="checkbox inline">
                <input type="checkbox" value="{{ branch }}" ng-model="branches[branch]" ng-checked="merge"
                 ng-change="filterSelectedBranches()" />
                {{ branch }}
              </label>
            </div>
            <input type="submit" class="button primary" value="Merge" ng-disabled="mergeFrm.$invalid"/>
            <a class="button" ng-click="isCollapsed = !isCollapsed">
              <span class="type-icon octicon"
               ng-class="{ true:'octicon-chevron-down', false:'octicon-chevron-up' }[isCollapsed]"></span>
              Step by step
              <span class="type-icon octicon"
               ng-class="{ true:'octicon-chevron-down', false:'octicon-chevron-up' }[isCollapsed]"></span>
            </a>
          </form>
          <div ng-hide="isCollapsed">
            <!-- create branch buttons -->
            <gh-branch-create-menu bases="selectedBranches" name="temporalBranch" repo="pr.base.repo.full_name">
            </gh-branch-create-menu>
            <!-- merge PR in local branch button -->
            <button class="btn btn-warning gh-merge" repo="{{pr.base.repo.full_name}}" base="{{temporalBranch}}"
             head="{{pr.originalElement.head.sha}}" msg="{{ commitMsg }}"
             title="Merge PR #{{ pr.number }} in {{ temporalBranch }} with message {{ commitMsg }}">
              <span class="type-icon octicon octicon-git-merge"></span>
              #{{ pr.number }} in {{ temporalBranch }}
            </button>
            <a class="btn" href="{{ pr.base.repo.html_url }}/tree/{{ temporalBranch  }}" target="_blank">
              Browse files and edit
            </a>
            <!-- Merge PR in final branches button -->
            <gh-merge-menu bases="selectedBranches" head="temporalBranch" repo="pr.base.repo.full_name" msg="commitMsg">
            </gh-merge-menu>
            <!-- delete local branch button -->
            <button class="btn btn-danger gh-branch-delete" repo="{{pr.base.repo.full_name}}" name="{{temporalBranch}}"
             title="Delete {{ temporalBranch }}">
              <span class="type-icon octicon octicon-git-branch-delete"></span>
              {{ temporalBranch }}
            </button>
          </div>
        </div>
    `;
    public replace:boolean = true;

    private gitFlow:GitFlowService;

    constructor(gitFlow:GitFlowService) {
        this.gitFlow = gitFlow;
    }

    controller($scope:ng.IScope):void {
        let pr:gh.IPr = $scope.pr;
        let prOriginalDstBranch:string = pr.base.ref;

        $scope.commitMsg = `Merge pull request #${pr.number}`;
        $scope.branches = {
            "master": false,
            "develop": false
        };
        $scope.branches[prOriginalDstBranch] = true;
        if (prOriginalDstBranch === "master") {
            $scope.patchType = "hotfix";
            $scope.branches.develop = true;
        } else if (prOriginalDstBranch === "develop") {
            $scope.patchType = "feature";
        }

        $scope.$watch("patchType", ():void => {
            $scope.temporalBranch = `ghgfk-${$scope.patchType}/${pr.number}`;
        });

        $scope.filterSelectedBranches = ():void => {
            let branches:string[] = [];
            for (let branch in $scope.branches) {
                if ($scope.branches.hasOwnProperty(branch) && $scope.branches[branch]) {
                    branches.push(branch);
                }
            }
            $scope.selectedBranches = branches;
        };
        $scope.filterSelectedBranches();

        $scope.merge = ():void => {
            this.gitFlow.merge($scope.pr, $scope.commitMsg, $scope.selectedBranches, $scope.temporalBranch);
        };
    }
}
