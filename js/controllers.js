angular.module('formulaOneApp.controllers', []).controller('DriverListController', function($scope, $state, popupService, $window, Driver) {
  $scope.drivers = Driver.query(); //fetch all drivers. Issues a GET to /api/drivers

}).controller('DriverViewController', function($scope, $stateParams, Driver) {
  $scope.driver = Driver.get({ id: $stateParams.id }); //Get a single driver. Issues a GET to /api/driver/:id
});
