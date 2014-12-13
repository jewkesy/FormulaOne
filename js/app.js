angular.module('formulaOneApp', ['ui.router', 'ngResource', 'formulaOneApp.controllers', 'formulaOneApp.services']);

angular.module('formulaOneApp').config(function($stateProvider) {
  $stateProvider
    .state('drivers', { // state for showing all drivers
    url: '/:season/drivers',
    templateUrl: 'partials/drivers.html',
    controller: 'DriverListController'
  }).state('viewDriver', { //state for showing single driver
    url: '/drivers/:id',
    templateUrl: 'partials/driver-view.html',
    controller: 'DriverViewController'
  }).state('circuits', {
    url: '/:season/circuits',
    templateUrl: 'partials/circuits.html',
    controller: 'CircuitListController'
  }).state('viewCircuit', {
    url: '/circuits/:id',
    templateUrl: 'partials/circuit-view.html',
    controller: 'CircuitViewController'
  }).state('constructors', {
    url: '/:season/constructors',
    templateUrl: 'partials/constructors.html',
    controller: 'ConstructorListController'
  }).state('viewConstructor', {
    url: '/constructors/:id',
    templateUrl: 'partials/constructor-view.html',
    controller: 'ConstructorViewController'
  }).state('results', {
    url: '/:season/results',
    templateUrl: 'partials/schedule.html',
    controller: 'ScheduleListController'
  });
}).run(function($state) {
  // console.log('going default')
  // if (!$state.season) $state.season = new Date().getFullYear();
  // $state.go('drivers', {'season': $state.season}); //make a transition to drivers state when app starts
});
