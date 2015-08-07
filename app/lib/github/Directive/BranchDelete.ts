import {RepositoryFactory} from "../RepositoryService.ts";

export class BranchDeleteFactory {
    static create(repoFactory:RepositoryFactory):BranchDelete {
        return new BranchDelete(repoFactory);
    }
}

export class BranchDelete implements ng.IDirective {
    public restrict:string = "AC";
    public link:ng.IDirectiveLinkFn;

    private repoFactory:RepositoryFactory;

    constructor(repoFactory:RepositoryFactory) {
        this.repoFactory = repoFactory;
        this.link = ($scope:ng.IScope, element:ng.IAugmentedJQuery, attrs:ng.IAttributes):void => {
            element.bind("click", () => {
                this.repoFactory.repository(attrs.repo).deleteBranch(attrs.name);
            });
        };
    }
}
