import {default as GithubModule }  from "../../app/lib/github/module.ts";
import {default as GithubDirectives }  from "../../app/lib/github/Directive/module.ts";
import {RepositoryFactory} from "../../app/lib/github/RepositoryService.ts";

let angularBaseElement = document.getElementsByClassName("js-pull-merging").item(0);
let insertPointElement = document.getElementsByClassName("merge-form-contents").item(0);

if (angularBaseElement && insertPointElement) {
    angularBaseElement = angular.element(angularBaseElement);
    insertPointElement = angular.element(insertPointElement);

    console.log("GHGFK: Start");

    let moduleName:string = "ghgfk.extension";
    angular.module(moduleName, [GithubModule, GithubDirectives]);
    let $injector = angular.bootstrap(angularBaseElement, [moduleName]);

    chrome.storage.sync.get("githubToken", function (options:{githubToken:string}) {
        console.log("GHGFK: Retrieving GitHub token");

        $injector.invoke(["githubConfigurator", function ($githubConfigurator) {
            console.log("GHGFK: Setting GitHub token");
            $githubConfigurator.token = options.githubToken;
        }]);

        $injector.invoke(["github.repository", "$compile",
            function (repoFactory:RepositoryFactory, $compile:ng.ICompileService) {
                let routeParams = new RegExp(/^\/(.*)\/pull\/(\d+)/).exec(location.pathname);
                let repoFullName = routeParams[1];
                let prNumber = routeParams[2];

                console.log(`GHGFK: Pull request #${prNumber}`);
                repoFactory.repository(repoFullName).getPr(prNumber).then(function (pr) {
                    let $scope = insertPointElement.scope();
                    $scope.pr = pr;

                    insertPointElement.html($compile('<merge-button pr="pr" />')($scope));
                });
            }]);
    });
}
