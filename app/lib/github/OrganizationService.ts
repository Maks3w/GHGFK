import {Github} from "./Github.ts";

export class OrganizationFactory {
    private github:Github;

    constructor(github:Github) {
        this.github = github;
    }

    organization(organization:string):OrganizationService {
        return new OrganizationService(this.github, organization);
    }
}

export class OrganizationService {
    private github:Github;
    private orgApi:string;

    constructor(github:Github, organization:string) {
        this.github = github;
        this.orgApi = `/orgs/${organization}`;
    }

    getRepositories(params?:{}):ng.IPromise<any> {
        return this.github.get(`${this.orgApi}/repos`, params);
    }
}
