angular.module('formulaOneApp.services', ['ngResource']).factory('Driver', function($resource) {
    return $resource('http://ergast.com/api/f1/2014/driverStandings.json', {
      'get': { method:'GET', cache: true, isArray:true }
      });
});
