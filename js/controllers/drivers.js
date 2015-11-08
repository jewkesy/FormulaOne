angular.module('formulaOneApp.controllers').controller('DriverListController', function($scope, $rootScope, $state, $stateParams, $window, $location, Driver) {
  var currentYear = new Date().getFullYear();
  if (!$stateParams.season || $stateParams.season > currentYear) $stateParams.season = currentYear;
  $rootScope.title = "Formula One Stats .:. " + $stateParams.season + " .:. Driver Standings";
  $scope.season = $stateParams.season;
  $scope.years = getYearRange();

  $scope.data = Driver.standings.get({season: $stateParams.season, series: 'f1' }, function(){
    // console.log($scope.data)
    $scope.content_loaded = true;
    var retVal = $scope.data.MRData.StandingsTable.StandingsLists[0]
    $scope.drivers = retVal

    var winDetails = {
      chartData: [[],[]],
      chartSeries: [],
      chartLabels: []
    }

    for (x = 0; x < retVal.DriverStandings.length; x++) {
      var win = retVal.DriverStandings[x]
      if (typeof win.Driver.code == 'undefined') win.Driver.code = win.Driver.familyName
      winDetails.chartLabels.push(win.Driver.code)
      winDetails.chartSeries.push(win.Driver.code)
      winDetails.chartData[0].push(win.points)
      winDetails.chartData[1].push(win.wins)
    }

    buildDriversChart(winDetails)
  }); //fetch all drivers. Issues a GET to /api/drivers

  $scope.$watch("season", function( value ) {
      if (value >= 1950) {
        $state.go('drivers', {'season': value});
      }
  });
  $location.path('/' + $stateParams.season + '/drivers');
  $scope.$on('$viewContentLoaded', function(event) {
    // console.log('viewContentLoaded', $location.url())
    $window.ga('send', 'pageview', { page: $location.url() });
  });

  function buildDriversChart(winDetails) {
    // console.log(winDetails.chartLabels, winDetails.chartData, winDetails.chartSeries)
    $scope.chartLabels = winDetails.chartLabels;
    $scope.chartData = winDetails.chartData;
    // $scope.series = winDetails.chartSeries;

    var width = $window.innerWidth
    if (width <= 400) 
      $scope.chartOptions = {legend: true, scaleUse2Y: true, animation: false}
    else if (width <= 640)
      $scope.chartOptions = {legend: true, scaleUse2Y: true, animation: true, animationStep: 10}
    else 
      $scope.chartOptions = {legend: true, scaleUse2Y: true, animation: true}
    
    $scope.onClick = function (points, evt) {
      // console.log(points, evt);
    };
    $scope.$on('create', function () {
       $scope.chartLoaded = true;
    });
  }

})