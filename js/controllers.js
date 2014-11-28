angular.module('formulaOneApp.controllers', [])
.controller('DriverListController', function($scope, $state, $stateParams, $window, Driver) {
  if (!$stateParams.season) $stateParams.season = new Date().getFullYear();
  console.log($stateParams.season)
  $scope.season = $stateParams.season;
  $scope.year = "Select season";
  $scope.data = Driver.standings.get({season: $stateParams.season, series: 'f1' }, function(){
    $scope.loaded = true;
    var retVal = $scope.data.MRData.StandingsTable.StandingsLists[0]
    $scope.drivers = retVal

    var startYear = new Date().getFullYear();
    var endYear = 1950;
    var dateRange = [];

    while(endYear <= startYear) {
        dateRange.push(startYear);
        startYear -= 1
    }
    $scope.years = dateRange;
  }); //fetch all drivers. Issues a GET to /api/drivers


  $scope.$watch(
    "seasonSelection",
    function( value ) {
      // if (!value) {
      //   return;
      // }
      console.log(value);
      if (value >= 1) {
        $state.go('drivers', {'season': value});
      }
    }
  );

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
