///<reference path="../../../typings/tsd.d.ts"/>

import {ConfiguratorProvider} from "./ConfiguratorProvider.ts";
import {Github} from "./Github.ts";
import {RepositoryService} from "./RepositoryService.ts";
import {readJSON} from "node_modules/karma-read-json/karma-read-json.js";

describe("RepositoryService unit tests", ():void => {
    let httpBackend:ng.IHttpBackendService;
    let repositoryService:RepositoryService;
    let repositoryFullName:string = "orgFoo/repoBaz";

    beforeEach(inject(($httpBackend:ng.IHttpBackendService, $http:ng.IHttpService) => {
        httpBackend = $httpBackend;

        repositoryService = new RepositoryService(
            new Github(new ConfiguratorProvider(), $http),
            repositoryFullName
        );

        httpBackend.whenGET("https://api.github.com/repos/orgFoo/repoBaz/milestones").respond([readJSON("test_fixtures/milestones_2.json")]);
        httpBackend.whenGET("https://api.github.com/repos/orgFoo/repoBaz/issues").respond([readJSON("test_fixtures/issues_2.json")]);
        httpBackend.whenGET("https://api.github.com/repos/orgFoo/repoBaz/issues/2").respond(readJSON("test_fixtures/issues_2.json"));
        httpBackend.whenPATCH("https://api.github.com/repos/orgFoo/repoBaz/issues/2", {
            "assignee": "userFoo"
        }).respond(readJSON("test_fixtures/issues_2.json"));
        httpBackend.whenGET("https://api.github.com/repos/orgFoo/repoBaz/pulls").respond([readJSON("test_fixtures/pulls_2.json")]);
        httpBackend.whenGET("https://api.github.com/repos/orgFoo/repoBaz/pulls/2").respond(readJSON("test_fixtures/pulls_2.json"));
        httpBackend.whenPOST("https://api.github.com/repos/orgFoo/repoBaz/merges", {
            "base": "master",
            "head": "ghgfk-hotfix/2",
            "commit_message": "Test Commit"
        }).respond(readJSON("test_fixtures/merges.json"));
        httpBackend.whenPOST("https://api.github.com/repos/orgFoo/repoBaz/git/refs", {
            "ref": "refs/heads/ghgfk-hotfix/2",
            "sha": "36878b1ad15f23e19894f877cc5cb94575fd0f06"
        }).respond(readJSON("test_fixtures/git_refs_heads_ghgfk-hotfix_2.json"));
        httpBackend.whenGET("https://api.github.com/repos/orgFoo/repoBaz/git/refs/heads/master").respond(readJSON("test_fixtures/git_refs_heads_master.json"));
        httpBackend.whenGET("https://api.github.com/repos/orgFoo/repoBaz/git/refs/heads/ghgfk-hotfix/2").respond(readJSON("test_fixtures/git_refs_heads_ghgfk-hotfix_2.json"));
        httpBackend.whenDELETE("https://api.github.com/repos/orgFoo/repoBaz/git/refs/heads/ghgfk-hotfix/2").respond(200, "");
    }));

    describe("getBranch()", ():void => {
        it("calls the expected API", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");

            repositoryService.getBranch("master").then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual(readJSON("test_fixtures/git_refs_heads_master.json"));
        });
    });

    describe("createBranch()", ():void => {
        it("calls the expected API", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");

            repositoryService.createBranch("ghgfk-hotfix/2", "master").then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual(readJSON("test_fixtures/git_refs_heads_ghgfk-hotfix_2.json"));
        });
    });

    describe("mergeBranch()", ():void => {
        it("calls the expected API", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");

            repositoryService.mergeBranch("ghgfk-hotfix/2", "master", "Test Commit").then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual(readJSON("test_fixtures/merges.json"));
        });
    });

    describe("deleteBranch()", ():void => {
        it("calls the expected API", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");

            repositoryService.deleteBranch("ghgfk-hotfix/2").then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual("");
        });
    });

    describe("getPr()", ():void => {
        it("calls the expected API", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");

            repositoryService.getPr(2).then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual(readJSON("test_fixtures/pulls_2.json"));
        });
    });

    describe("getPrs()", ():void => {
        it("calls the expected API", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");

            repositoryService.getPrs().then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual([readJSON("test_fixtures/pulls_2.json")]);
        });
    });

    describe("getIssue()", ():void => {
        it("calls the expected API", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");

            repositoryService.getIssue(2).then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual(readJSON("test_fixtures/issues_2.json"));
        });
    });

    describe("updateIssue()", ():void => {
        it("calls the expected API", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");

            repositoryService.updateIssue(2, {
                "assignee": "userFoo"
            }).then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual(readJSON("test_fixtures/issues_2.json"));
        });
    });

    describe("getMilestones()", ():void => {
        it("calls the expected API", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");

            repositoryService.getMilestones().then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual([readJSON("test_fixtures/milestones_2.json")]);
        });
    });
});
