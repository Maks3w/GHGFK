/**
 * AngularJS module for GitHub API
 */

import {ConfiguratorProvider} from "./ConfiguratorProvider.ts";
import {Github} from "./Github.ts";
import {GitFlowService} from "./GitFlowService.ts";
import {LoggedUserService} from "./LoggedUserService.ts";
import {OrganizationFactory} from "./OrganizationFactory.ts";
import {RepositoryService} from "./RepositoryService.ts";

Github.$inject = ["githubConfigurator", "$http"];
LoggedUserService.$inject = ["github"];
OrganizationFactory.$inject = ["github"];
RepositoryService.$inject = ["github"];
GitFlowService.$inject = ["github.repository", "github.loggedUser", "$rootScope", "$q"];

let moduleName:string = "maks3w.github";

angular.module(moduleName, ["ng"])
    .provider("githubConfigurator", ConfiguratorProvider)
    .service("github", Github)
    .service("github.git-flow", GitFlowService)
    .service("github.loggedUser", LoggedUserService)
    .factory("github.organization", (github:Github) => {
        return (organization:string) => {
            return new OrganizationFactory(github, organization);
        };
    })
    .factory("github.repository", (github:Github) => {
        return (fullName:string) => {
            return new RepositoryService(github, fullName);
        };
    })
;

export {
    ConfiguratorProvider,
    Github,
    GitFlowService,
    LoggedUserService,
    OrganizationFactory,
    RepositoryService
}

export default moduleName;
