///<reference path="../../../typings/tsd.d.ts"/>

import {ConfiguratorProvider} from "./ConfiguratorProvider.ts";
import {Github} from "./Github.ts";
import {LoggedUserService} from "./LoggedUserService.ts";
import {readJSON} from "node_modules/karma-read-json/karma-read-json.js";

describe("LoggedUserService unit tests", ():void => {
    let httpBackend:ng.IHttpBackendService;
    let loggedUserService:LoggedUserService;

    beforeEach(inject(($httpBackend:ng.IHttpBackendService, $http:ng.IHttpService) => {
        httpBackend = $httpBackend;

        loggedUserService = new LoggedUserService(new Github(new ConfiguratorProvider(), $http));
    }));

    describe("getUser()", ():void => {
        it("calls the expected API", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");
            let user:gh.IUser = readJSON("test_fixtures/user.json");

            httpBackend.expectGET("https://api.github.com/user")
                .respond(user);
            loggedUserService.getUser().then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual(user);
        });
    });
});
