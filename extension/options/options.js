angular.element(document).ready(function () {
  angular.bootstrap(document,['GHGFK']);
  chrome.storage.sync.set({'githubToken': localStorage['githubToken']});
});
