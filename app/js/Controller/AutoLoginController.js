(function () {
  "use strict";

  angular
    .module("GHGFK")
    .controller("AutoLoginController", AutoLoginController)
  ;

  AutoLoginController.$inject = ["$location", "AuthenticationService"];
  function AutoLoginController($location, AuthenticationService) {
    if (AuthenticationService.hasCredentials()) {
      AuthenticationService.login()
        .then(function () {
          $location.path("/");
        })
      ;
    } else {
      $location.path("/login");
    }
  }
})();
