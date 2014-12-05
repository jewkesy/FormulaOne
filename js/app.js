angular.module('formulaOneApp', ['ui.router', 'ngResource', 'formulaOneApp.controllers', 'formulaOneApp.services']);

angular.module('formulaOneApp').config(function($stateProvider) {
  $stateProvider.state('drivers', { // state for showing all drivers
    url: '/:season/drivers',
    templateUrl: 'partials/drivers.html',
    controller: 'DriverListController'
  }).state('viewDriver', { //state for showing single driver
    url: '/driver/:id',
    templateUrl: 'partials/driver-view.html',
    controller: 'DriverViewController'
  }).state('cicuits', {
    url: '/:season/circuits',
    templateUrl: 'partials/drivers.html',
    controller: 'CircuitListController'
  }).state('circuit', {
    url: '/circuit/:id',
    templateUrl: 'partials/circuit-view.html',
    controller: 'CircuitViewController'
  });
}).run(function($state) {
  if (!$state.season) $state.season = new Date().getFullYear();
  $state.go('drivers', {'season': $state.season}); //make a transition to drivers state when app starts
});
