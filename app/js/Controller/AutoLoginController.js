(function () {
  "use strict";

  angular
    .module("GHGFK")
    .controller("AutoLoginController", AutoLoginController)
  ;

  AutoLoginController.$inject = ["$scope", "$location", "AuthenticationService"];
  function AutoLoginController($scope, $location, AuthenticationService) {
    if (AuthenticationService.hasCredentials()) {
      AuthenticationService.login()
        .then(function () {
          $location.path("/");
          $scope.$apply();
        })
      ;
    } else {
      $location.path("/login");
    }
  }
})();
