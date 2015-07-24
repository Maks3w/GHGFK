(function () {
  "use strict";

  angular
    .module("GHGFK")
    .controller("LoginController", LoginController)
  ;

  LoginController.$inject = ["$scope", "$location", "AuthenticationService"];
  function LoginController($scope, $location, AuthenticationService) {
    $scope.github_token = AuthenticationService.getCredentials();
    $scope.login = login;

    function login() {
      AuthenticationService.login($scope.github_token)
        .then(
          function () {
            $location.path("/");
            $scope.$apply();
          }
        )
      ;
    }
  }
})();
