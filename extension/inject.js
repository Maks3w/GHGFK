var insertPoint = $('.merge-branch-form-actions');

angular.element(insertPoint).ready(function () {
  console.log('GHGFK: Start');

  var $injector = angular.bootstrap(insertPoint, ['GHGFK.controllers', 'maks3w.github', 'maks3w.github.directives']);

  chrome.storage.sync.get('githubToken', function (options) {
    console.log('GHGFK: Retriving GitHub token');

    $injector.invoke(function ($githubConfigurator) {
      console.log('GHGFK: Setting GitHub token');
      $githubConfigurator.token = options.githubToken;
    });

    $injector.invoke(function ($github, $rootScope, $compile) {
      var $scope = angular.element(insertPoint).scope();

      var regexp = new RegExp(/^\/(.*)\/pull\/(\d+)/)
      var routeParams = regexp.exec(location.pathname);
      var repoFullName = routeParams[1];
      var prNumber = routeParams[2];

      console.log('GHGFK: Pull request');
      $github.one('repos', repoFullName).one('pulls', prNumber).get().then(function (pr) {
        $scope.pr = pr;

        insertPoint.append($compile('<merge-button pr="pr" />')($scope));
      });
    });
  });
});
