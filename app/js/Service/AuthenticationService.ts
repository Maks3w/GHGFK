///<reference path="../../../typings/tsd.d.ts"/>

import {ConfiguratorProvider} from "../../lib/github/ConfiguratorProvider.ts";
import {LoggedUserService} from "../../lib/github/LoggedUserService.ts";

export class AuthenticationService {
    private $rootScope:ng.IRootScopeService;
    private githubConfigurator:ConfiguratorProvider;
    private githubLoggedUserService:LoggedUserService;

    constructor($rootScope:ng.IRootScopeService, githubConfigurator:ConfiguratorProvider, githubLoggedUserService:LoggedUserService) {
        this.$rootScope = $rootScope;
        this.githubConfigurator = githubConfigurator;
        this.githubLoggedUserService = githubLoggedUserService;
    }

    login(gitHubToken?:string):ng.IPromise<gh.IUser> {
        if (typeof gitHubToken === "undefined") {
            gitHubToken = this.getCredentials();
        }

        this.githubConfigurator.token = gitHubToken;

        return this.githubLoggedUserService.getUser()
            .then((response:gh.IUser):gh.IUser => {
                this.setCredentials(gitHubToken, response);

                return response;
            });
    }

    setCredentials(gitHubToken:string, user:gh.IUser):void {
        this.$rootScope.user = user;
        localStorage.githubToken = gitHubToken;
    }

    /**
     * @returns {string|null}
     */
    getCredentials():string {
        if (typeof localStorage.githubToken !== "string") {
            return null;
        }

        return localStorage.githubToken;
    }

    hasCredentials():boolean {
        return (typeof localStorage.githubToken === "string");
    }

    isLogged():boolean {
        return (typeof this.$rootScope.user === "object");
    }

    getIdentity():gh.IUser {
        if (!this.isLogged()) {
            throw "User is not logged";
        }

        return this.$rootScope.user;
    }
}
