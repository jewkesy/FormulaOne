angular.module('formulaOneApp.controllers', [])
.controller('DriverListController', function($scope, $state, $window, Driver) {
  $scope.data = Driver.get(function(){
    $scope.loaded = true;
    var retVal = $scope.data.MRData.StandingsTable.StandingsLists[0].DriverStandings
    console.log(retVal)
    $scope.drivers = retVal
  }); //fetch all drivers. Issues a GET to /api/drivers

}).controller('DriverViewController', function($scope, $stateParams, Driver) {
  $scope.driver = Driver.get({ id: $stateParams.id }); //Get a single driver. Issues a GET to /api/driver/:id
});
