var angularBaseElement = document.getElementsByClassName('js-pull-merging').item(0);
var insertPointElement = document.getElementsByClassName('merge-form-contents').item(0);

if (angularBaseElement && insertPointElement) {
  angularBaseElement = angular.element(angularBaseElement);
  insertPointElement = angular.element(insertPointElement);

  angularBaseElement.ready(function () {
    console.log('GHGFK: Start');

    var $injector = angular.bootstrap(angularBaseElement, ['GHGFK']);

    chrome.storage.sync.get('githubToken', function (options) {
      console.log('GHGFK: Retrieving GitHub token');

      $injector.invoke(function ($githubConfigurator) {
        console.log('GHGFK: Setting GitHub token');
        $githubConfigurator.token = options.githubToken;
      });

      $injector.invoke(function ($github, $rootScope, $compile) {
        var regexp = new RegExp(/^\/(.*)\/pull\/(\d+)/);
        var routeParams = regexp.exec(location.pathname);
        var repoFullName = routeParams[1];
        var prNumber = routeParams[2];

        console.log('GHGFK: Pull request');
        $github.all('repos/' + repoFullName).one('pulls', prNumber).get().then(function (pr) {
          var $scope = insertPointElement.scope();
          $scope.pr = pr;

          insertPointElement.html($compile('<merge-button pr="pr" />')($scope));
        });
      });
    });
  });
}
