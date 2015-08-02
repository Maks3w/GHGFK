///<reference path="../../../typings/tsd.d.ts"/>

import {RepositoryFactory} from "../../lib/github/RepositoryService.ts";

export class PrsController {
    public per_page:number;
    public currentPage:number;
    public repoFullName:string;
    public prs:gh.IPr[] = [];

    private githubRepoFactory:RepositoryFactory;

    constructor($routeParams:angular.route.IRouteParamsService, githubRepoFactory:RepositoryFactory) {
        this.githubRepoFactory = githubRepoFactory;
        this.per_page = $routeParams.per_page || 100;
        this.currentPage = $routeParams.page || 1;
        this.repoFullName = `${$routeParams.organization}/${$routeParams.repo}`;
        this.fetchPrs(this.repoFullName, this.currentPage, this.per_page);
    }

    fetchPrs(repoFullName:string, page:number, per_page:number):ng.IPromise<gh.IPr[]> {
        let params:{} = {
            page: page,
            per_page: per_page
        };

        return this.githubRepoFactory.repository(repoFullName).getPrs(params)
            .then((prs:gh.IPr[]):gh.IPr[] => {
                this.prs = prs;

                return prs;
            })
            ;
    };
}
