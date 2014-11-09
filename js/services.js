angular.module('formulaOneApp.services', ['ngResource']).factory('Driver', function($resource) {
    return {
      standings: $resource('http://ergast.com/api/f1/2014/driverStandings.json', {
        'get': { method:'GET', cache: true, isArray:true }
      }),
      driver: $resource('http://ergast.com/api/f1/drivers/:id.json', {
        'get': { method:'GET', cache: true, isArray:true }
      })
    };
});
