///<reference path="../../../../typings/tsd.d.ts"/>

export class BranchCreateFactory {
    static create(repoFactory):BranchCreate {
        return new BranchCreate(repoFactory);
    }
}

export class BranchCreate implements ng.IDirective {
    public restrict:string = "AC";
    public link:ng.IDirectiveLinkFn;

    private repoFactory;

    constructor(repoFactory) {
        this.repoFactory = repoFactory;
        this.link = ($scope:ng.IScope, element:ng.IAugmentedJQuery, attrs:ng.IAttributes):void  => {
            element.bind("click", () => {
                this.repoFactory(attrs.repo).createBranch(attrs.name, attrs.base);
            });
        };
    }
}
