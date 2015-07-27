(function () {
  "use strict";

  angular
    .module("GHGFK")
    .factory("AuthenticationService", AuthenticationService)
  ;

  AuthenticationService.$inject = ["$rootScope", "$githubConfigurator", "github.loggedUser"];
  function AuthenticationService($rootScope, $githubConfigurator, githubLoggedUserService) {
    var service = {};

    service.login = login;
    service.setCredentials = setCredentials;
    service.getCredentials = getCredentials;
    service.hasCredentials = hasCredentials;
    service.isLogged = isLogged;
    service.getIdentity = getIdentity;

    return service;

    /**
     * @param {string?} gitHubToken
     * @returns {*}
     */
    function login(gitHubToken) {
      if (typeof gitHubToken === "undefined") {
        gitHubToken = this.getCredentials();
      }

      $githubConfigurator.token = gitHubToken;

      var login = this;
      return githubLoggedUserService.getUser()
        .then(function (response) {
          login.setCredentials(gitHubToken, response);

          return response;
        });
    }

    /**
     * @param {string} gitHubToken
     * @param {{}} user
     */
    function setCredentials(gitHubToken, user) {
      $rootScope.user = user;
      $rootScope.$apply();
      localStorage.githubToken = gitHubToken;
    }

    /**
     * @returns {string|null}
     */
    function getCredentials() {
      if (typeof localStorage.githubToken !== "string") {
        return null;
      }

      return localStorage.githubToken;
    }

    /**
     * @returns {boolean}
     */
    function hasCredentials() {
      return (typeof localStorage.githubToken === "string");
    }

    /**
     * @returns {bool}
     */
    function isLogged() {
      return (typeof $rootScope.user === "object");
    }

    /**
     * @returns {{}} user
     */
    function getIdentity() {
      if (!this.isLogged()) {
        throw "User is not logged";
      }

      return $rootScope.user;
    }
  }
})();
