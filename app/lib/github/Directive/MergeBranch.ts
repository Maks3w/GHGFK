import {RepositoryFactory} from "../RepositoryService.ts";

export class MergeBranchFactory {
    static create(repoFactory:RepositoryFactory):MergeBranch {
        return new MergeBranch(repoFactory);
    }
}

export class MergeBranch implements ng.IDirective {
    public restrict:string = "AC";
    public link:ng.IDirectiveLinkFn;

    private repoFactory:RepositoryFactory;

    constructor(repoFactory:RepositoryFactory) {
        this.repoFactory = repoFactory;
        this.link = ($scope:ng.IScope, element:ng.IAugmentedJQuery, attrs:ng.IAttributes):void => {
            element.bind("click", () => {
                this.repoFactory.repository(attrs.repo).mergeBranch(attrs.head, attrs.base, attrs.msg);
            });
        };
    }
}
