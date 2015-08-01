import {AlertController} from "./Controller/AlertController.ts";
import {AuthenticationService} from "./Service/AuthenticationService.ts";
import {AutoLoginController} from "./Controller/AutoLoginController.ts";
import {LoginController} from "./Controller/LoginController.ts";
import {OrganizationsController} from "./Controller/OrganizationsController.ts";
import {PrsController} from "./Controller/PrsController.ts";
import {RepositoriesController} from "./Controller/RepositoriesController.ts";
import {default as GithubModule }  from "../lib/github/module.ts";
import {default as GithubDirectives }  from "../lib/github/Directive/module.ts";

AlertController.$inject = ["$scope"];
AuthenticationService.$inject = ["$rootScope", "githubConfigurator", "github.loggedUser"];
AutoLoginController.$inject = ["$location", "AuthenticationService"];
LoginController.$inject = ["$location", "AuthenticationService"];
OrganizationsController.$inject = ["AuthenticationService", "github.loggedUser"];
PrsController.$inject = ["$routeParams", "github.repository"];
RepositoriesController.$inject = ["AuthenticationService", "$routeParams", "github.loggedUser", "github.organization"];

// Declare app level module which depends on filters, and services
let moduleName:string = "ghgfk";
angular.module(moduleName, [GithubModule, GithubDirectives, "ngRoute"])
    .config(["$routeProvider", function ($routeProvider:angular.route.IRouteProvider):void {
        $routeProvider.when("/", {
            redirectTo: "/repo"
        });
        $routeProvider.when("/auto_login", {
            templateUrl: "partials/autoLogin.html",
            controller: "AutoLoginController",
            controllerAs: "vm"
        });
        $routeProvider.when("/login", {
            templateUrl: "partials/login.html",
            controller: "LoginController",
            controllerAs: "vm"
        });
        $routeProvider.when("/repo", {
            templateUrl: "partials/orgList.html",
            controller: "OrganizationsController",
            controllerAs: "vm"
        });
        $routeProvider.when("/repo/:organization", {
            templateUrl: "partials/repoList.html",
            controller: "RepositoriesController",
            controllerAs: "vm"
        });
        $routeProvider.when("/repo/:organization/:repo", {
            templateUrl: "partials/prList.html",
            controller: "PrsController",
            controllerAs: "vm"
        });
        $routeProvider.when("/repo/:organization/:repo/page/:page/per_page/:per_page", {
            templateUrl: "partials/prList.html",
            controller: "PrsController",
            controllerAs: "vm"
        });
        $routeProvider.otherwise({redirectTo: "/"});
    }])
    .run(["$rootScope", "AuthenticationService", "$location",
        function ($rootScope:ng.IRootScopeService,
                  AuthenticationService:AuthenticationService,
                  $location:ng.ILocationService):void {
            $rootScope.$on("$locationChangeStart", function ():void {
                // redirect to login page if not logged in and trying to access a restricted page
                let isRestrictedPage:boolean = (["/login", "/auto_login"].indexOf($location.path()) === -1);
                let isLoggedIn:boolean = AuthenticationService.isLogged();
                if (isRestrictedPage && !isLoggedIn) {
                    $location.path("/auto_login");
                }
            });
        }])
    .config(["$httpProvider", function ($httpProvider:ng.IHttpProvider):void {
        $httpProvider.interceptors.push("httpResponseInterceptor");
    }])
    .factory("httpResponseInterceptor", ["$q", "$location", "$rootScope",
        function ($q:ng.IQService, $location:ng.ILocationService, $rootScope:ng.IRootScopeService):{} {
            return {
                responseError: notifyAndRedirect
            };

            function notifyAndRedirect(response:{status:number, data?:{message?:string}}):ng.IPromise<any> {
                if (response.status === 401) {
                    $location.path("/login");
                }

                $rootScope.$broadcast("alert.new", "error", response.data.message);

                return $q.reject(response);
            }
        }])
    .controller("AlertController", AlertController)
    .controller("AutoLoginController", AutoLoginController)
    .controller("LoginController", LoginController)
    .controller("LoginController", LoginController)
    .controller("OrganizationsController", OrganizationsController)
    .controller("PrsController", PrsController)
    .controller("RepositoriesController", RepositoriesController)
    .service("AuthenticationService", AuthenticationService)
;

angular.bootstrap(document, [moduleName]);
