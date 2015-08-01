///<reference path="../../../typings/tsd.d.ts"/>

import {AuthenticationService} from "../Service/AuthenticationService.ts";
import {LoggedUserService} from "../../lib/github/LoggedUserService.ts";

export class OrganizationsController {
    public organizations:gh.IOrganization[];

    private githubLoggedUserService:LoggedUserService;

    constructor(AuthenticationService:AuthenticationService, githubLoggedUserService:LoggedUserService) {
        this.githubLoggedUserService = githubLoggedUserService;
        let loggedUser:gh.IUser = AuthenticationService.getIdentity();

        this.fetchUserOrganizations()
            .then((orgs:gh.IOrganization[]):void => {
                orgs.unshift(loggedUser);
                this.organizations = orgs;
            })
        ;
    }

    fetchUserOrganizations():ng.IPromise<gh.IOrganization[]> {
        return this.githubLoggedUserService.getOrganizations();
    }
}
