///<reference path="../../../typings/tsd.d.ts"/>

import {ConfiguratorProvider} from "./ConfiguratorProvider.ts";
import {GitFlowService} from "./GitFlowService.ts";
import {Github} from "./Github.ts";
import {LoggedUserService} from "./LoggedUserService.ts";
import {RepositoryService} from "./RepositoryService.ts";
import {readJSON} from "node_modules/karma-read-json/karma-read-json.js";

describe("GitFlowService unit tests", ():void => {
    let gitFlowService:GitFlowService;
    let httpBackend:ng.IHttpBackendService;
    let repositoryFullName:string = "orgFoo/repoBaz";

    beforeEach(inject(($httpBackend:ng.IHttpBackendService, $http:ng.IHttpService, $rootScope:ng.IRootScopeService, $q:ng.IQService) => {
        httpBackend = $httpBackend;

        let github:Github = new Github(new ConfiguratorProvider(), $http);
        let repositoryService:RepositoryService = new RepositoryService(github, repositoryFullName);
        let githubLoggedUserService:LoggedUserService = new LoggedUserService(github);

        gitFlowService = new GitFlowService(() => { return repositoryService; }, githubLoggedUserService, $rootScope, $q);
    }));

    describe("merge()", ():void => {
        it("perform a git flow when 2 branches are given", ():void => {
            let pr:gh.IPr = readJSON("test_fixtures/pulls_2.json");

            // 1. Verify PR is mergeable
            httpBackend.expectGET("https://api.github.com/repos/orgFoo/repoBaz/pulls/2")
                .respond(readJSON("test_fixtures/pulls_2.json"));

            // 2. GitFlow create temporal branch
            httpBackend.whenGET("https://api.github.com/repos/orgFoo/repoBaz/git/refs/heads/master")
                .respond(readJSON("test_fixtures/git_refs_heads_master.json"));
            httpBackend.expectPOST("https://api.github.com/repos/orgFoo/repoBaz/git/refs", {
                "ref": "refs/heads/ghgfk-hotfix/2",
                "sha": "36878b1ad15f23e19894f877cc5cb94575fd0f06"
            }).respond(readJSON("test_fixtures/git_refs_heads_ghgfk-hotfix_2.json"));

            // 3. GitFlow merge PR into temporal branch (PR is mergeable against master)
            httpBackend.expectPOST("https://api.github.com/repos/orgFoo/repoBaz/merges", {
                "base": "ghgfk-hotfix/2",
                "head": "159de4fcde94c1a0ca60f5c722cf8d6caa940d33", // PR head reference
                "commit_message": "Test Commit"
            }).respond(readJSON("test_fixtures/merges.json"));

            // 4. GitFlow merge PR into develop branch (PR is mergeable against develop)
            httpBackend.expectPOST("https://api.github.com/repos/orgFoo/repoBaz/merges", {
                "base": "develop",
                "head": "ghgfk-hotfix/2",
                "commit_message": "Test Commit in develop"
            }).respond(readJSON("test_fixtures/merges.json"));

            // 5. GitFlow merge PR into master branch (Everything is merged)
            httpBackend.expectPOST("https://api.github.com/repos/orgFoo/repoBaz/merges", {
                "base": "master",
                "head": "ghgfk-hotfix/2",
                "commit_message": "Test Commit in master"
            }).respond(readJSON("test_fixtures/merges.json"));

            // 6. GitFlow Remove temporal branch
            httpBackend.expectDELETE("https://api.github.com/repos/orgFoo/repoBaz/git/refs/heads/ghgfk-hotfix/2")
                .respond(200, "");

            // A. "Lock" issue by assign the current user
            httpBackend.whenGET("https://api.github.com/user")
                .respond(readJSON("test_fixtures/user.json"));
            httpBackend.whenPATCH("https://api.github.com/repos/orgFoo/repoBaz/issues/2", {
                "assignee": "userFoo"
            }).respond(readJSON("test_fixtures/issues_2.json"));

            // B. Set milestone
            httpBackend.whenGET("https://api.github.com/repos/orgFoo/repoBaz/milestones")
                .respond([readJSON("test_fixtures/milestones_2.json")]);
            httpBackend.whenPATCH("https://api.github.com/repos/orgFoo/repoBaz/issues/2", {
                "milestone": 2
            }).respond(readJSON("test_fixtures/issues_2.json"));

            gitFlowService.merge(pr, "Test Commit", ["master", "develop"], "ghgfk-hotfix/2");

            httpBackend.flush();
        });
        it("perform a simple merge when only 1 branch is given", ():void => {
            let pr:gh.IPr = readJSON("test_fixtures/pulls_2.json");

            // 1. Verify PR is mergeable
            httpBackend.expectGET("https://api.github.com/repos/orgFoo/repoBaz/pulls/2")
                .respond(readJSON("test_fixtures/pulls_2.json"));

            // 2. merge PR in target branch
            httpBackend.expectPOST("https://api.github.com/repos/orgFoo/repoBaz/merges", {
                "base": "master",
                "head": "159de4fcde94c1a0ca60f5c722cf8d6caa940d33", // PR head reference
                "commit_message": "Test Commit"
            }).respond(readJSON("test_fixtures/merges.json"));

            // A. "Lock" issue by assign the current user
            httpBackend.whenGET("https://api.github.com/user")
                .respond(readJSON("test_fixtures/user.json"));
            httpBackend.whenPATCH("https://api.github.com/repos/orgFoo/repoBaz/issues/2", {
                "assignee": "userFoo"
            }).respond(readJSON("test_fixtures/issues_2.json"));

            // B. Set milestone
            httpBackend.whenGET("https://api.github.com/repos/orgFoo/repoBaz/milestones")
                .respond([readJSON("test_fixtures/milestones_2.json")]);
            httpBackend.whenPATCH("https://api.github.com/repos/orgFoo/repoBaz/issues/2", {
                "milestone": 2
            }).respond(readJSON("test_fixtures/issues_2.json"));

            gitFlowService.merge(pr, "Test Commit", ["master"], "ghgfk-hotfix/2");

            httpBackend.flush();
        });
    });
});
