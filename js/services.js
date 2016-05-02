angular.module('formulaOneApp.services', ['ngResource'])
  .factory('Weather', function($resource) {
    return {
      // Current -  http://api.openweathermap.org/data/2.5/weather?lat=35&lon=139
      // 5 Day -    http://api.openweathermap.org/data/2.5/forecast?lat=35&lon=139
      // 16 day -   http://api.openweathermap.org/data/2.5/forecast/daily?lat=35&lon=139&cnt=10&mode=json
      current: $resource(config.weatherFeed + 'weather?&lat=:latitude&lon=:longitude&units=:units&APPID=' + config.weatherApi, {
        'get': { method: 'JSONP', cache: true, isArray: true }
      }),
      forecast: $resource(config.weatherFeed + 'forecast?&lat=:latitude&lon=:longitude&units=:units&APPID=' + config.weatherApi, {
        'get': { method: 'JSONP', cache: true, isArray: true }
      }),
      extended: $resource(config.weatherFeed + 'forecast/daily?&lat=:latitude&lon=:longitude&cnt=:days&units=:units&APPID=' + config.weatherApi, {
        'get': { method: 'JSONP', cache: true, isArray: true }
      })
    };
  }).factory('News', function($resource) {
    return {
      latestNews: $resource(config.googleNews, {
        'get': { method: 'JSONP', cache: true, isArray: true }
      }),
      twitter: $resource(config.twitterFeed, {
        'get': { method: 'JSONP', cache: true, isArray: true }
      })
    };
  }).factory('Driver', function($resource) {
    return {
      driver: $resource(config.api + ':series/drivers/:id.json', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      results: $resource(config.api + ':series/drivers/:id/results.json?limit=1000', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      driverStandings: $resource(config.api + ':series/drivers/:id/driverStandings.json', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      cache: $resource('db/cache/drivers/:id.json', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      mongo: $resource(config.mongo.host + config.mongo.database + '/collections/drivers?q={"_id": ":id", "series": ":series"}&apiKey=' + config.mongo.apiKey + '&callback=CALLBACK', {
        'query': {method: 'GET', cache: true, isArray: false }
      })
    };
  }).factory('DriverStandings', function($resource) {
    return {
      standings: $resource(config.api + ':series/:season/driverStandings.json', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      mongo: $resource(config.mongo.host + config.mongo.database + '/collections/driverstandings?q={"_id": ":season", "series": ":series"}&apiKey=' + config.mongo.apiKey + '&callback=CALLBACK', {
        'query': {method: 'GET', cache: true, isArray: false }
      })
    };
  }).factory('Circuit', function($resource) {
    return {
      circuits: $resource(config.api + ':series/:season/circuits.json', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      circuit: $resource(config.api + ':series/circuits/:id.json', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      mongo: $resource(config.mongo.host + config.mongo.database + '/collections/circuits?q={"_id": ":season", "series": ":series"}&apiKey=' + config.mongo.apiKey + '&callback=CALLBACK', {
        'query': {method: 'GET', cache: true, isArray: false }
      })
    };
  }).factory('Constructor', function($resource) {
    return {
      standings: $resource(config.api + ':series/:season/constructorStandings.json?limit=1000', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      constructor: $resource(config.api + ':series/constructors/:id/constructorStandings.json?limit=1000', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      cache: $resource('db/cache/constructors/:id.json', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      mongo: $resource(config.mongo.host + config.mongo.database + '/collections/constructors?q={"_id": ":id", "series": ":series"}&apiKey=' + config.mongo.apiKey + '&callback=CALLBACK', {
        'query': {method: 'GET', cache: true, isArray: false }
      })
    };
  }).factory('ConstructorStandings', function($resource) {
    return {
      standings: $resource(config.api + ':series/:season/constructorStandings.json?limit=1000', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      mongo: $resource(config.mongo.host + config.mongo.database + '/collections/constructorstandings?q={"_id": ":season", "series": ":series"}&apiKey=' + config.mongo.apiKey + '&callback=CALLBACK', {
        'query': {method: 'GET', cache: true, isArray: false }
      })
    };
  }).factory('Result', function($resource) {
    return {
      race: $resource(config.api + ':series/:season/:id/results.json', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      qualifying: $resource(config.api + ':series/:season/:id/qualifying.json', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      laps: $resource(config.api + ':series/:season/:id/laps.json?limit=:limit&offset=:offset', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      pits: $resource(config.api + ':series/:season/:id/pitstops.json?limit=1000', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      cacheDriverList: $resource('db/cache/drivers.json', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      mongoResults: $resource(config.mongo.host + config.mongo.database + '/collections/results?q={"_id": ":season:round", "series": ":series"}&apiKey=' + config.mongo.apiKey + '&callback=CALLBACK', {
        'query': {method: 'GET', cache: true, isArray: false }
      }),
      mongoLaps: $resource(config.mongo.host + config.mongo.database + '/collections/laps?q={"_id": ":season:round", "series": ":series"}&apiKey=' + config.mongo.apiKey + '&callback=CALLBACK', {
        'query': {method: 'GET', cache: true, isArray: false }
      }),
      mongoPits: $resource(config.mongo.host + config.mongo.database + '/collections/pits?q={"_id": ":season:round", "series": ":series"}&apiKey=' + config.mongo.apiKey + '&callback=CALLBACK', {
        'query': {method: 'GET', cache: true, isArray: false }
      })
    };
  }).factory('Schedule', function($resource) {
    return {
      schedule: $resource(config.api + ':series/:season.json', {
        'get': { method: 'GET', cache: true, isArray: true }
      }),
      mongo: $resource(config.mongo.host + config.mongo.database + '/collections/schedule?q={"_id": ":season", "series": ":series"}&apiKey=' + config.mongo.apiKey + '&callback=CALLBACK', {
        'query': {method: 'GET', cache: true, isArray: false }
      })
    };
  });
