angular.module('formulaOneApp', ['ui.router', 'ngResource', 'formulaOneApp.controllers', 'formulaOneApp.services']);

angular.module('formulaOneApp').config(function($stateProvider) {
  $stateProvider.state('drivers', { // state for showing all drivers
    url: '/drivers',
    templateUrl: 'partials/drivers.html',
    controller: 'DriverListController'
  }).state('viewDriver', { //state for showing single driver
    url: '/driver.json/:id',
    templateUrl: 'partials/driver-view.html',
    controller: 'DriverViewController'
  });
}).run(function($state) {
  $state.go('drivers'); //make a transition to drivers state when app starts
});
