export class BranchCreateMenuFactory {
    static create():BranchCreateMenu {
        return new BranchCreateMenu();
    }
}

export class BranchCreateMenu implements ng.IDirective {
    public replace:boolean = true;
    public restrict:string = "E";
    public scope:{} = {
        bases: "=bases",
        branchName: "=name",
        repo: "=repo"
    };
    public template:string = `
        <div class="btn-group">
          <button class="btn btn-warning gh-branch-create" tabindex="-1" name="{{branchName}}" base="{{ bases[0] }}"
           repo="{{ repo }}" title="Create branch {{ branchName }} from {{ bases[0] }}">
            <span class="type-icon octicon octicon-git-branch-create"></span>
            {{ branchName }}
          </button>
          <button class="btn btn-warning dropdown-toggle" data-toggle="dropdown" tabindex="-1">
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu">
            <li ng-repeat="base in bases">
              <a class="gh-branch-create" name="{{ branchName }}" base="{{ base }}" repo="{{ repo }}"
               title="Create branch {{ branchName }} from {{ base }}">
                {{ base }}
              </a>
            </li>
          </ul>
        </div>
    `;
}
