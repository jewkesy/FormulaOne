angular.module('formulaOne.services', []).factory('Stats', function($resource) {
  return $resource('http://ergast.com/api/f1/2014/driverStandings.json?callback=JSON_CALLBACK', { id: '@_id' }, {
    update: {
      method: 'PUT'
    }
  });
});
