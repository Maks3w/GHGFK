///<reference path="../../../typings/tsd.d.ts"/>

import {AuthenticationService} from "../Service/AuthenticationService.ts";
import {LoggedUserService} from "../../lib/github/LoggedUserService.ts";

export class RepositoriesController {
    public repositories:gh.IRepository[] = [];

    private githubLoggedUserService:LoggedUserService;
    private githubOrganizationFactory;
    private AuthenticationService:AuthenticationService;

    constructor(AuthenticationService:AuthenticationService,
                $routeParams:angular.route.IRouteParamsService,
                githubLoggedUserService:LoggedUserService,
                githubOrganizationFactory) {
        this.AuthenticationService = AuthenticationService;
        this.githubLoggedUserService = githubLoggedUserService;
        this.githubOrganizationFactory = githubOrganizationFactory;
        this.fetchRepositories($routeParams.organization)
            .then((repositories:gh.IRepository[]) => {
                this.repositories = repositories;
            })
        ;
    }

    fetchRepositories(organization:string):ng.IPromise<gh.IRepository[]> {
        let promise:ng.IPromise<gh.IRepository[]>;
        let listParams:{} = {
            per_page: 200
        };

        let loggedUser:gh.IUser = this.AuthenticationService.getIdentity();
        if (organization === loggedUser.login) {
            listParams = angular.extend(
                listParams,
                {
                    affiliation: "owner,collaborator",
                    direction: "asc",
                    sort: "full_name"
                }
            );
            promise = this.githubLoggedUserService.getRepositories(listParams);
        } else {
            listParams = angular.extend(
                listParams,
                {
                    type: "member"
                }
            );
            promise = this.githubOrganizationFactory(organization).getRepositories(listParams);
        }

        return promise;
    }
}
