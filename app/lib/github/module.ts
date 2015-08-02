/**
 * AngularJS module for GitHub API
 */

import {ConfiguratorProvider} from "./ConfiguratorProvider.ts";
import {Github} from "./Github.ts";
import {GitFlowService} from "./GitFlowService.ts";
import {LoggedUserService} from "./LoggedUserService.ts";
import {OrganizationFactory} from "./OrganizationService.ts";
import {RepositoryFactory} from "./RepositoryService.ts";

Github.$inject = ["githubConfigurator", "$http"];
LoggedUserService.$inject = ["github"];
OrganizationFactory.$inject = ["github"];
RepositoryFactory.$inject = ["github"];
GitFlowService.$inject = ["github.repository", "github.loggedUser", "$rootScope", "$q"];

let moduleName:string = "maks3w.github";

angular.module(moduleName, ["ng"])
    .provider("githubConfigurator", ConfiguratorProvider)
    .service("github", Github)
    .service("github.git-flow", GitFlowService)
    .service("github.loggedUser", LoggedUserService)
    .service("github.organization", OrganizationFactory)
    .service("github.repository", RepositoryFactory)
;

export {
    ConfiguratorProvider,
    Github,
    GitFlowService,
    LoggedUserService,
    OrganizationFactory,
    RepositoryFactory
}

export default moduleName;
