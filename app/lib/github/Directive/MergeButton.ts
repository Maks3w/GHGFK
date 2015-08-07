import {GitFlowService} from "../GitFlowService";

export class Factory {
    static create():Directive {
        return new Directive();
    }
}

export class Directive implements ng.IDirective {
    public bindToController:boolean = true;
    public controllerAs:string = "vm";
    public controller:any = Controller;
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
          <form ng-model="vm.pr" ng-submit="vm.merge(vm.pr, vm.commitMsg, vm.selectedBranches, vm.temporalBranch)" name="mergeFrm"
           novalidate ng-init="isCollapsed = true">
            <label>
              Patch type
              <select ng-model="vm.patchType" required>
                <option value="">Select patch type</option>
                <option value="hotfix">Hotfix</option>
                <option value="feature">Feature</option>
              </select>
            </label>
            <label>
              Commit msg
              <input type="text" ng-model="vm.commitMsg" ng-bind-template="Merge PR #{{vm.pr.number}}" required/>
            </label>
            <div class="control-group">
              <label ng-repeat="(branch, merge) in vm.branches" class="checkbox inline">
                <input type="checkbox" value="{{ branch }}" ng-model="vm.branches[branch]" ng-checked="merge"
                 ng-change="vm.filterSelectedBranches()" />
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
            <gh-branch-create-menu bases="vm.selectedBranches" name="vm.temporalBranch" repo="vm.pr.base.repo.full_name">
            </gh-branch-create-menu>
            <!-- merge PR in local branch button -->
            <button class="btn btn-warning gh-merge" repo="{{vm.pr.base.repo.full_name}}" base="{{vm.temporalBranch}}"
             head="{{vm.pr.originalElement.head.sha}}" msg="{{ vm.commitMsg }}"
             title="Merge PR #{{ vm.pr.number }} in {{ vm.temporalBranch }} with message {{ vm.commitMsg }}">
              <span class="type-icon octicon octicon-git-merge"></span>
              #{{ vm.pr.number }} in {{ vm.temporalBranch }}
            </button>
            <a class="btn" href="{{ vm.pr.base.repo.html_url }}/tree/{{ vm.temporalBranch  }}" target="_blank">
              Browse files and edit
            </a>
            <!-- Merge PR in final branches button -->
            <gh-merge-menu bases="vm.selectedBranches" head="vm.temporalBranch" repo="vm.pr.base.repo.full_name" msg="commitMsg">
            </gh-merge-menu>
            <!-- delete local branch button -->
            <button class="btn btn-danger gh-branch-delete" repo="{{vm.pr.base.repo.full_name}}" name="{{vm.temporalBranch}}"
             title="Delete {{ vm.temporalBranch }}">
              <span class="type-icon octicon octicon-git-branch-delete"></span>
              {{ vm.temporalBranch }}
            </button>
          </div>
        </div>
    `;
    public replace:boolean = true;
}

export class Controller {
    public branches:{master:boolean, develop:boolean} = {
        "master": false,
        "develop": false
    };
    public commitMsg:string;
    public patchType:string;
    public pr:gh.IPr; // Angular automatically bind the value of this property
    public selectedBranches:string[] = [];
    public temporalBranch:string;

    private gitFlow:GitFlowService;

    constructor(gitFlow:GitFlowService, $scope:ng.IScope) {
        this.gitFlow = gitFlow;
        this.commitMsg = `Merge pull request #${this.pr.number}`;

        let prOriginalDstBranch:string = this.pr.base.ref;
        this.branches[prOriginalDstBranch] = true;
        if (prOriginalDstBranch === "master") {
            this.patchType = "hotfix";
            this.branches.develop = true;
        } else if (prOriginalDstBranch === "develop") {
            this.patchType = "feature";
        }

        $scope.$watch("patchType", ():void => {
            this.temporalBranch = `ghgfk-${this.patchType}/${this.pr.number}`;
        });

        this.filterSelectedBranches();
    }

    filterSelectedBranches():void {
        this.selectedBranches = [];
        for (let branch in this.branches) {
            if (this.branches.hasOwnProperty(branch) && this.branches[branch]) {
                this.selectedBranches.push(branch);
            }
        }
    }

    merge(pr:gh.IPr, commitMsg:string, selectedBranches:string[], temporalBranch:string):void {
        this.gitFlow.merge(pr, commitMsg, selectedBranches, temporalBranch);
    }
}
