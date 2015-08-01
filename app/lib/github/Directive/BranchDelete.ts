///<reference path="../../../../typings/tsd.d.ts"/>

export class BranchDeleteFactory {
    static create(repoFactory):BranchDelete {
        return new BranchDelete(repoFactory);
    }
}

export class BranchDelete implements ng.IDirective {
    public restrict:string = "AC";
    public link:ng.IDirectiveLinkFn;

    private repoFactory;

    constructor(repoFactory) {
        this.repoFactory = repoFactory;
        this.link = ($scope:ng.IScope, element:ng.IAugmentedJQuery, attrs:ng.IAttributes):void => {
            element.bind("click", () => {
                this.repoFactory(attrs.repo).deleteBranch(attrs.name);
            });
        };
    }
}
