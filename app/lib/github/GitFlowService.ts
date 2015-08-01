///<reference path="../../../typings/tsd.d.ts"/>

import {LoggedUserService} from "./LoggedUserService.ts";
import {RepositoryService} from "./RepositoryService.ts";

export class GitFlowService {
    private repoFactory;
    private $rootScope:ng.IRootScopeService;
    private $q:ng.IQService;
    private githubLoggedUserService:LoggedUserService;

    constructor(repoFactory, githubLoggedUserService:LoggedUserService, $rootScope:ng.IRootScopeService, $q:ng.IQService) {
        this.repoFactory = repoFactory;
        this.githubLoggedUserService = githubLoggedUserService;
        this.$rootScope = $rootScope;
        this.$q = $q;
    }

    merge(pr:gh.IPr, commitMsg:string, selectedBranches:string[], temporalBranch:string):ng.IPromise<any> {
        let prOriginalDstBranch:string = pr.base.ref;
        let repository:RepositoryService = this.repoFactory(pr.base.repo.full_name);
        return repository.getPr(pr.number)
            .then((currentPr:gh.IPr):ng.IPromise<gh.IUser> => {
                pr = currentPr;
                if (!this.isMergeable(pr)) {
                    this.$q.reject(`#${pr.number} cannot be merged`);
                }

                // Assign the PR to the user for prevent merge by other user
                return this.githubLoggedUserService.getUser();
            })
            .then((user:gh.IUser) => {
                if (pr.assignee === null) {
                    repository.updateIssue(pr.number, {
                        "assignee": user.login
                    });
                } else if (pr.assignee.login !== user.login) {
                    this.$q.reject(`#${pr.number} cannot be merged while is assigned to ${pr.assignee.login}`);
                }

                if (selectedBranches.length === 1) {
                    if (prOriginalDstBranch === "develop" && prOriginalDstBranch !== selectedBranches[0]) {
                        // Prevent merge develop PR against master with all develop history
                        this.$q.reject(`#${pr.number} cannot be merged against master because it is based on develop`);
                    }
                    this.simpleMerge(pr, commitMsg, selectedBranches[0]);
                } else {
                    this.gitFlowMerge(pr, temporalBranch, commitMsg, "master", "develop");
                }

                repository.getMilestones()
                    .then((milestones:gh.IMilestone[]) => {
                        if (milestones.length === 0) {
                            return;
                        }

                        milestones.sort((a:gh.IPr, b:gh.IPr) => {
                            let av:string = a.title.replace(".", "");
                            let ab:string = b.title.replace(".", "");
                            return av - ab;
                        });

                        let milestoneNumber:number;
                        if (selectedBranches.indexOf("master") !== -1) { // PR goes against MASTER
                            milestoneNumber = milestones[0].number;
                        } else {
                            if (milestones.length < 2) { // If only exists 1 milestone, do nothing
                                return;
                            }
                            milestoneNumber = milestones[1].number;
                        }

                        return repository.updateIssue(pr.number, {
                            "milestone": milestoneNumber
                        });
                    });
            })
            .catch((reason:string):void => {
                this.$rootScope.$broadcast("alert.new", "err", reason);
            });
    }

    simpleMerge(pr:gh.IPr, commitMsg:string, dstBranch:string):ng.IPromise<any> {
        console.log(`Merging #${pr.number} in ${dstBranch} with commit ${commitMsg}`);
        let repository:RepositoryService = this.repoFactory(pr.base.repo.full_name);
        return repository.mergeBranch(pr.head.sha, dstBranch, commitMsg)
            .then(() => {
                console.log(`#${pr.number} merged`);
                this.$rootScope.$broadcast("alert.new", "info", `#${pr.number} merged`);
            });
    }

    gitFlowMerge(pr:gh.IPr, temporalBranch:string, commitMsg:string, master:string, develop:string):ng.IPromise<any> {
        console.log(`Merging ${temporalBranch} in ${[master, develop]} with commit ${commitMsg}`);
        let repository:RepositoryService = this.repoFactory(pr.base.repo.full_name);
        return repository.createBranch(temporalBranch, master)
            .then(() => {
                console.log(`Merging #${pr.number} in ${temporalBranch}`);
                return repository.mergeBranch(pr.head.sha, temporalBranch, commitMsg);
            })
            .then(() => {
                console.log(`Merging ${temporalBranch} in ${develop}`);
                return repository.mergeBranch(temporalBranch, develop, `${commitMsg} in ${develop}`);
            })
            .then(() => {
                this.$rootScope.$broadcast("alert.new", "info", `${temporalBranch} merged in ${develop}`);

                console.log(`Merging ${temporalBranch} in ${master}`);
                return repository.mergeBranch(temporalBranch, master, `${commitMsg} in ${master}`);
            })
            .then(() => {
                this.$rootScope.$broadcast("alert.new", "info", `${temporalBranch} merged in ${master}`);

                console.log(`#${pr.number} merged`);
                return repository.deleteBranch(temporalBranch);
            });
    }

    isMergeable(pr:gh.IPr):boolean {
        return pr.mergeable && !pr.merged;
    }
}
