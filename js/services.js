angular.module('formulaOneApp.services', []).factory('Driver', function($resource) {
    return $resource('http://ergast.com/api/f1/drivers.json?callback=myParser', {});
});
