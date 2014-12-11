angular.module('formulaOneApp.services', ['ngResource'])
  .factory('Driver', function($resource) {
    return {
      standings: $resource('http://ergast.com/api/:series/:season/driverStandings.json', {
        'get': { method:'GET', cache: true, isArray:true }
      }),
      driver: $resource('http://ergast.com/api/:series/drivers/:id.json', {
        'get': { method:'GET', cache: true, isArray:true }
      }),
      driverStandings: $resource('http://ergast.com/api/:series/drivers/:id/driverStandings.json', {
        'get': { method:'GET', cache: true, isArray:true }
      })
    };
  }).factory('Circuit', function($resource) {
    return {
      circuits: $resource('http://ergast.com/api/:series/:season/circuits.json', {
        'get': { method:'GET', cache: true, isArray:true }
      }),
      circuit: $resource('http://ergast.com/api/:series/circuits/:id.json', {
        'get': { method:'GET', cache: true, isArray:true }
      })
    };
  }).factory('Constructor', function($resource) {
    return {
      standings: $resource('http://ergast.com/api/:series/:season/constructorStandings.json', {
        'get': { method:'GET', cache: true, isArray:true }
      }),
      constructor: $resource('http://ergast.com/api/:series/constructors/:id/constructorStandings.json', {
        'get': { method:'GET', cache: true, isArray:true }
      })
    }
});
