import {ConfiguratorProvider} from "./ConfiguratorProvider.ts";
import {Github} from "./Github.ts";

describe("Github unit tests", ():void => {
    let httpBackend:ng.IHttpBackendService;
    let configurator:ConfiguratorProvider;
    let github:Github;

    function assertDefaultHeaders(headers:{Accept:string, Authorization:string}):boolean {
        return (
            headers.Accept === "application/vnd.github.raw" &&
            headers.Authorization === "token fooToken"
        );
    }

    beforeEach(inject(($httpBackend:ng.IHttpBackendService, $http:ng.IHttpService) => {
        httpBackend = $httpBackend;
        configurator = new ConfiguratorProvider();
        configurator.token = "fooToken";

        github = new Github(configurator, $http);
    }));

    describe("get is well formed", ():void => {
        it("when no query params is given", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");
            let responseData:{} = {
                "APIResponse": "baz"
            };

            httpBackend.expectGET("https://api.github.com/foo", assertDefaultHeaders)
                .respond(responseData);

            github.get("/foo").then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual(responseData);
        });

        it("when query params is given", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");
            let responseData:{} = {
                "APIResponse": "baz"
            };

            httpBackend.expectGET("https://api.github.com/foo?paramFoo=valueBaz", assertDefaultHeaders)
                .respond(responseData);

            github.get("/foo", {
                "paramFoo": "valueBaz"
            }).then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual(responseData);
        });
    });

    describe("patch is well formed", ():void => {
        it("send the given body", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");
            let requestData:{} = {
                "APIRequest": "baz"
            };
            let responseData:{} = {
                "APIResponse": "baz"
            };

            httpBackend.expectPATCH("https://api.github.com/foo", requestData, assertDefaultHeaders)
                .respond(responseData);

            github.patch("/foo", requestData).then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual(responseData);
        });
    });

    describe("post is well formed", ():void => {
        it("send the given body", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");
            let requestData:{} = {
                "APIRequest": "baz"
            };
            let responseData:{} = {
                "APIResponse": "baz"
            };

            httpBackend.expectPOST("https://api.github.com/foo", requestData, assertDefaultHeaders)
                .respond(responseData);

            github.post("/foo", requestData).then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual(responseData);
        });
    });

    describe("put is well formed", ():void => {
        it("send the given body", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");
            let requestData:{} = {
                "APIRequest": "baz"
            };
            let responseData:{} = {
                "APIResponse": "baz"
            };

            httpBackend.expectPUT("https://api.github.com/foo", requestData, assertDefaultHeaders)
                .respond(responseData);

            github.put("/foo", requestData).then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual(responseData);
        });
    });

    describe("delete is well formed", ():void => {
        it("no body is returned", ():void => {
            let promiseThen:jasmine.Spy = jasmine.createSpy("then");

            httpBackend.expectDELETE("https://api.github.com/foo", assertDefaultHeaders)
                .respond(200, "");

            github.delete("/foo").then(promiseThen);

            httpBackend.flush();

            expect(promiseThen).toHaveBeenCalled();
            expect(promiseThen.calls.mostRecent().args[0]).toEqual("");
        });
    });
});
