angular.element(document).ready(function () {
  angular.bootstrap(document,['GHGFK.controllers', 'maks3w.github', 'maks3w.github.directives']);
  chrome.storage.sync.set({'githubToken': localStorage['githubToken']});
});
