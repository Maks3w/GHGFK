import {AuthenticationService} from "../../app/js/Service/AuthenticationService.ts";
import {LoginController} from "../../app/js/Controller/LoginController.ts";
import {default as GithubModule }  from "../../app/lib/github/module.ts";
import {default as GithubDirectives }  from "../../app/lib/github/Directive/module.ts";

AuthenticationService.$inject = ["$rootScope", "githubConfigurator", "github.loggedUser"];
LoginController.$inject = ["$location", "AuthenticationService"];

let moduleName:string = "ghgfk.extension.options";
angular.module(moduleName, [GithubModule, GithubDirectives])
    .controller("LoginController", LoginController)
    .service("AuthenticationService", AuthenticationService)
;

angular.bootstrap(document, [moduleName]);

chrome.storage.sync.set({"githubToken": localStorage["githubToken"]});
