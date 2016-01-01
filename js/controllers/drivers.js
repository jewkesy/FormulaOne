angular.module('formulaOneApp.controllers').controller('DriverListController', function($scope, $rootScope, $state, $stateParams, $window, $location, DriverStandings) {
  var currentYear = new Date().getFullYear();
  if (!$stateParams.season || $stateParams.season > currentYear) $stateParams.season = currentYear;
  $rootScope.title = "Formula One Stats .:. " + $stateParams.season + " .:. Driver Standings";
  $scope.season = $stateParams.season;
  $scope.years = getYearRange();

  $scope.data = DriverStandings.mongo.query({ season: $stateParams.season, series: 'f1' }, function(response){
    if (typeof($scope.data[0]) == 'undefined') {
      // console.log('undefined')
      $scope.data = DriverStandings.standings.get({season: $stateParams.season, series: 'f1' }, function(){
        // console.log($scope.data)
        $scope.content_loaded = true;
        
        if ($scope.data.MRData.total == 0) return;
        $scope.has_content = true;

        var retVal = $scope.data.MRData.StandingsTable.StandingsLists[0]
        retVal._id = $stateParams.season
        retVal.series = 'f1'

        retVal.chartData = [[],[]];
        retVal.chartSeries = [];
        retVal.chartLabels = [];
        
        for (x = 0; x < retVal.DriverStandings.length; x++) {
          var win = retVal.DriverStandings[x]
          if (typeof win.Driver.code == 'undefined') win.Driver.code = win.Driver.familyName
          retVal.chartLabels.push(win.Driver.code)
          retVal.chartSeries.push(win.Driver.code)
          retVal.chartData[0].push(win.points)
          retVal.chartData[1].push(win.wins)
        }
        // console.log(retVal)
        if (new Date().getFullYear().toString() != $stateParams.season) {
          $.ajax( { url: config.mongo.host + config.mongo.database + '/collections/driverstandings?apiKey=' + config.mongo.apiKey,
            data: JSON.stringify(retVal),
            type: "POST",
            contentType: "application/json" 
          });
        }

        buildDriversChart(retVal)
      });
    } else {
      $scope.content_loaded = true;
      $scope.has_content = true;
      // console.log('defined', $scope.data[0])
      buildDriversChart($scope.data[0])
    }
  });

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
    $scope.drivers = winDetails
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