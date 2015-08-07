import {Github} from "./Github.ts";

export class LoggedUserService {
    private userApi:string = "/user";
    private github:Github;

    constructor(github:Github) {
        this.github = github;
    }

    getUser():ng.IPromise<gh.IUser> {
        return this.github.get(this.userApi);
    }

    getOrganizations(params?:{}):ng.IPromise<gh.IOrganization[]> {
        return this.github.get(`${this.userApi}/orgs`, params);
    }

    getRepositories(params?:{}):ng.IPromise<gh.IRepository[]> {
        return this.github.get(`${this.userApi}/repos`, params);
    }
}
