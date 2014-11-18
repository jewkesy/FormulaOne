angular.module('formulaOneApp.controllers', [])
.controller('DriverListController', function($scope, $stateParams, $window, Driver) {
  if (!$stateParams.season) $stateParams.season = new Date().getFullYear();
  $scope.data = Driver.standings.get({season: $stateParams.season, series: 'f1' }, function(){
    $scope.loaded = true;
    var retVal = $scope.data.MRData.StandingsTable.StandingsLists[0]
    $scope.drivers = retVal
    $scope.season = $stateParams.season
  }); //fetch all drivers. Issues a GET to /api/drivers

}).controller('DriverViewController', function($scope, $stateParams, Driver) {
  $scope.data = Driver.driver.get({ id: $stateParams.id, series: 'f1' }, function(){
    $scope.loaded = true;
    var retVal = $scope.data.MRData.DriverTable.Drivers[0];

    var ageDifMs = Date.now() - new Date(retVal.dateOfBirth);
    var ageDate = new Date(ageDifMs); // miliseconds from epoch

    retVal.Age = Math.abs(ageDate.getUTCFullYear() - 1970);

    $scope.driver = retVal
  }); //Get a single driver. Issues a GET to /api/driver/:id
});
