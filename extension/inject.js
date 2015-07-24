var angularBaseElement = $('.js-pull-merging');
var insertPoint = $('.merge-form-contents');

if (angularBaseElement.length !== 0) {
  angular.element(angularBaseElement).ready(function () {
    console.log('GHGFK: Start');

    var $injector = angular.bootstrap(angularBaseElement, ['GHGFK']);

    chrome.storage.sync.get('githubToken', function (options) {
      console.log('GHGFK: Retrieving GitHub token');

      $injector.invoke(function ($githubConfigurator) {
        console.log('GHGFK: Setting GitHub token');
        $githubConfigurator.token = options.githubToken;
      });

      $injector.invoke(function ($github, $rootScope, $compile) {
        var $scope = angular.element(angularBaseElement).scope();

        var regexp = new RegExp(/^\/(.*)\/pull\/(\d+)/);
        var routeParams = regexp.exec(location.pathname);
        var repoFullName = routeParams[1];
        var prNumber = routeParams[2];

        console.log('GHGFK: Pull request');
        $github.all('repos/' + repoFullName).one('pulls', prNumber).get().then(function (pr) {
          $scope.pr = pr;

          insertPoint.html($compile('<merge-button pr="pr" />')($scope));
        });
      });
    });
  });
}
