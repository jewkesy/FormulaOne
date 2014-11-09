angular.module('formulaOneApp.controllers', [])
.controller('DriverListController', function($scope, $state, $window, Driver) {
  $scope.data = Driver.standings.get(function(){
    $scope.loaded = true;
    var retVal = $scope.data.MRData.StandingsTable.StandingsLists[0].DriverStandings
    $scope.drivers = retVal
  }); //fetch all drivers. Issues a GET to /api/drivers

}).controller('DriverViewController', function($scope, $stateParams, Driver) {
  $scope.data = Driver.driver.get({ id: $stateParams.id }, function(){
    $scope.loaded = true;
    var retVal = $scope.data.MRData.DriverTable.Drivers[0]
    console.log(retVal);
    $scope.driver = retVal
  }); //Get a single driver. Issues a GET to /api/driver/:id
});
