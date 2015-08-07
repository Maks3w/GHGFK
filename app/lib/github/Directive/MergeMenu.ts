export class Factory {
    static create():Directive {
        return new Directive();
    }
}

export class Directive implements ng.IDirective {
    public replace:boolean = true;
    public restrict:string = "E";
    public scope:{} = {
        bases: "=bases",
        head: "=head",
        msg: "=msg",
        repo: "=repo"
    };
    public template:string = `
        <div class="btn-group">
          <button class="btn btn-warning gh-merge" tabindex="-1" head="{{head}}" base="{{ bases[0] }}" repo="{{ repo }}"
           msg="{{ msg }} into {{ bases[0] }}" title="Merge {{ head }} into {{ bases[0] }}">
            <span class="type-icon octicon octicon-git-merge"></span>
             {{ head }} in {{ bases[0] }}
          </button>
          <button class="btn btn-warning dropdown-toggle" data-toggle="dropdown" tabindex="-1">
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu">
            <li ng-repeat="base in bases">
              <a class="gh-merge" head="{{ head }}" base="{{ base }}" repo="{{ repo }}" msg="{{ msg }} into {{ base }}"
               title="Merge {{ head }} into {{ base }}">
              {{ base }}
              </a>
            </li>
          </ul>
        </div>
    `;
}
