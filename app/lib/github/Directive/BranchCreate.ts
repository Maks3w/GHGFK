import {RepositoryFactory} from "../RepositoryService.ts";

export class BranchCreateFactory {
    static create(repoFactory:RepositoryFactory):BranchCreate {
        return new BranchCreate(repoFactory);
    }
}

export class BranchCreate implements ng.IDirective {
    public restrict:string = "AC";
    public link:ng.IDirectiveLinkFn;

    private repoFactory:RepositoryFactory;

    constructor(repoFactory:RepositoryFactory) {
        this.repoFactory = repoFactory;
        this.link = ($scope:ng.IScope, element:ng.IAugmentedJQuery, attrs:ng.IAttributes):void  => {
            element.bind("click", () => {
                this.repoFactory.repository(attrs.repo).createBranch(attrs.name, attrs.base);
            });
        };
    }
}
