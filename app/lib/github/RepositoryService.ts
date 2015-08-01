///<reference path="../../../typings/tsd.d.ts"/>

import {Github} from "./Github.ts";

export class RepositoryService {
    private github:Github;
    private repoApi:string;
    private refApi:string;

    constructor(github:Github, fullName:string) {
        this.github = github;
        this.repoApi = `/repos/${fullName}`;
        this.refApi = `${this.repoApi}/git/refs`;
    }

    createBranch(branchName:string, branchSource:string):ng.IPromise<any> {
        console.log(`Making ${branchName} based in ${branchSource}`);
        return this.getBranch(branchSource)
            .then((data:gh.IReference) => {
                return this.github.post(this.refApi, {
                    "ref": `refs/heads/${branchName}`,
                    "sha": data.object.sha
                });
            }
        );
    }

    getBranch(branch:string):ng.IPromise<gh.IReference> {
        return this.github.get(`${this.refApi}/heads/${branch}`);
    }

    deleteBranch(branch:string):ng.IPromise<{}> {
        console.log(`Removing ${branch}`);
        return this.github.delete(`${this.refApi}/heads/${branch}`);
    }

    mergeBranch(head:string, base:string, commit:string):ng.IPromise<any> {
        console.log(`Merging ${head} in ${base}`);
        return this.github.post(`${this.repoApi}/merges`, {
            "base": base,
            "head": head,
            "commit_message": commit
        });
    }

    getPr(number:number):ng.IPromise<gh.IPr> {
        return this.github.get(`${this.repoApi}/pulls/${number}`);
    }

    getPrs(params?:{}):ng.IPromise<gh.IPr[]> {
        return this.github.get(`${this.repoApi}/pulls`, params);
    }

    getIssue(number:number):ng.IPromise<gh.IIssue> {
        return this.github.get(`${this.repoApi}/issues/${number}`);
    }

    updateIssue(number:number, params?:{}):ng.IPromise<gh.IIssue> {
        return this.github.patch(`${this.repoApi}/issues/${number}`, params);
    }

    getMilestones(params?:{}):ng.IPromise<gh.IMilestone[]> {
        return this.github.get(`${this.repoApi}/milestones`, params);
    }
}
