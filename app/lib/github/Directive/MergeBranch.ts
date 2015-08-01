///<reference path="../../../../typings/tsd.d.ts"/>

export class MergeBranchFactory {
    static create(repoFactory):MergeBranch {
        return new MergeBranch(repoFactory);
    }
}

export class MergeBranch implements ng.IDirective {
    public restrict:string = "AC";
    public link:ng.IDirectiveLinkFn;

    private repoFactory;

    constructor(repoFactory) {
        this.repoFactory = repoFactory;
        this.link = ($scope:ng.IScope, element:ng.IAugmentedJQuery, attrs:ng.IAttributes):void => {
            element.bind("click", () => {
                this.repoFactory(attrs.repo).mergeBranch(attrs.head, attrs.base, attrs.msg);
            });
        };
    }
}
