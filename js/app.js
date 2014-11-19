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
  });
}).run(function($state) {
  $state.go('drivers', {'season': $state.season}); //make a transition to drivers state when app starts
});
