angular.module('formulaOneApp.services', ['ngResource']).factory('Driver', function($resource) {
    return {
      standings: $resource('http://ergast.com/api/:series/:season/driverStandings.json', {
        'get': { method:'GET', cache: true, isArray:true }
      }),
      driver: $resource('http://ergast.com/api/:series/drivers/:id.json', {
        'get': { method:'GET', cache: true, isArray:true }
      })
    };
  }).factory('Circuits', function($resource) {
    return {
      circuits: $resource('http://ergast.com/api/:series/:season/circuits.json', {
        'get': { method:'GET', cache: true, isArray:true }
      })
    };
  }).factory('Constructors', function($resources) {
    return {
      constructors: $resource('http://ergast.com/api/:series/:season/constructors.json', {
        'get': { method:'GET', cache: true, isArray:true }
      })
    }
});
