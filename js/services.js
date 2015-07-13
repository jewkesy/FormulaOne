angular.module('formulaOneApp.services', ['ngResource'])
  .factory('Weather', function($resource) {
    return {
      // Current -  http://api.openweathermap.org/data/2.5/weather?lat=35&lon=139
      // 5 Day -    http://api.openweathermap.org/data/2.5/forecast?lat=35&lon=139
      // 16 day -   http://api.openweathermap.org/data/2.5/forecast/daily?lat=35&lon=139&cnt=10&mode=json
      current: $resource(config.weatherFeed + 'weather?&lat=:latitude&lon=:longitude&units=:unit', {
        'get': {method: 'JSONP', cache: true, isArray: true }
      }),
      forecast: $resource(config.weatherFeed + 'forecast?&lat=:latitude&lon=:longitude&cnt=:days&units=:unit', {
        'get': {method: 'JSONP', cache: true, isArray: true }
      }),
      extended: $resource(config.weatherFeed + 'forecast/daily?&lat=:latitude&lon=:longitude&cnt=:days&units=:unit', {
        'get': {method: 'JSONP', cache: true, isArray: true }
      })
    };
  }).factory('News', function($resource) {
    return {
      latestNews: $resource(config.googleNews, {
        'get':  { method: 'JSONP', cache: true, isArray: true }
      })
    };
  }).factory('Driver', function($resource) {
    return {
      standings: $resource(config.api + ':series/:season/driverStandings.json', {
        'get': { method:'GET', cache: true, isArray:true }
      }),
      driver: $resource(config.api + ':series/drivers/:id.json', {
        'get': { method:'GET', cache: true, isArray:true }
      }),
      driverStandings: $resource(config.api + ':series/drivers/:id/driverStandings.json', {
        'get': { method:'GET', cache: true, isArray:true }
      }),
      cache: $resource('db/cache/drivers/:id.json', {
        'get': { method:'GET', cache: true, isArray:true }
      })
    };
  }).factory('Circuit', function($resource) {
    return {
      circuits: $resource(config.api + ':series/:season/circuits.json', {
        'get': { method:'GET', cache: true, isArray:true }
      }),
      circuit: $resource(config.api + ':series/circuits/:id.json', {
        'get': { method:'GET', cache: true, isArray:true }
      })
    };
  }).factory('Constructor', function($resource) {
    return {
      standings: $resource(config.api + ':series/:season/constructorStandings.json', {
        'get': { method:'GET', cache: true, isArray:true }
      }),
      constructor: $resource(config.api + ':series/constructors/:id/constructorStandings.json', {
        'get': { method:'GET', cache: true, isArray:true }
      }),
      cache: $resource('db/cache/constructors/:id.json', {
        'get': { method:'GET', cache: true, isArray:true }
      })
    };
  }).factory('Result', function($resource) {
    return {
      race: $resource(config.api + ':series/:season/:id/results.json', {
        'get': { method:'GET', cache: true, isArray:true }
      }),
      qualifying: $resource(config.api + ':series/:season/:id/qualifying.json', {
        'get': { method:'GET', cache: true, isArray:true }
      })
    };
  }).factory('Schedule', function($resource) {
    return {
      schedule: $resource(config.api + ':series/:season.json', {
        'get': { method:'GET', cache: true, isArray:true }
      })
    };
});
