///<reference path="../../../typings/tsd.d.ts"/>

export class PrsController {
    public per_page:number;
    public currentPage:number;
    public repoFullName:string;
    public prs:gh.IPr[] = [];

    private githubRepoFactory;

    constructor($routeParams:angular.route.IRouteParamsService, githubRepoFactory) {
        this.githubRepoFactory = githubRepoFactory;
        this.per_page = $routeParams.per_page;
        this.currentPage = $routeParams.page;
        this.repoFullName = `${$routeParams.organization}/${$routeParams.repo}`;
        this.fetchPrs(this.repoFullName, $routeParams.page, $routeParams.per_page);
    }

    fetchPrs(repoFullName:string, page:number, per_page:number):ng.IPromise<gh.IPr[]> {
        let params:{} = {
            page: page,
            per_page: per_page
        };

        return this.githubRepoFactory(repoFullName).getPrs(params)
            .then((prs:gh.IPr[]):void => {
                this.prs = prs;
            })
            ;
    };
}
