angular.module('formulaOneApp.controllers').controller('ConstructorListController', function($scope, $rootScope, $state, $stateParams, $window, $location, ConstructorStandings) {
  var currentYear = new Date().getFullYear();
  if (!$stateParams.season || $stateParams.season > currentYear) $stateParams.season = currentYear;
  $rootScope.title = "Formula One Stats .:. " + $stateParams.season + " .:. Constructor Standings";
  $scope.season = $stateParams.season;
  $scope.years = getYearRange();

  $scope.data = ConstructorStandings.mongo.query({ season: $stateParams.season, series: 'f1' }, function(response){
    if (typeof($scope.data[0]) == 'undefined') {
      // console.log('undefined')
      $scope.data = ConstructorStandings.standings.get({season: $stateParams.season, series: 'f1' }, function(){
        $scope.content_loaded = true;
        var retVal = $scope.data.MRData.StandingsTable.StandingsLists[0]
        retVal._id = $stateParams.season
        retVal.series = 'f1'
        //console.log(retVal)
        $scope.teams = retVal //NOTE constructor is a reserved AngularJs name!

        retVal.chartData = [[],[]];
        retVal.chartSeries = [];
        retVal.chartLabels = [];

        // console.log(retVal)
        for (x = 0; x < retVal.ConstructorStandings.length; x++) {
          var win = retVal.ConstructorStandings[x]

          retVal.chartLabels.push(win.Constructor.name)
          retVal.chartSeries.push(win.Constructor.name)
          retVal.chartData[0].push(win.points)
          retVal.chartData[1].push(win.wins)
        }
        if (new Date().getFullYear().toString() != $stateParams.season) {
          $.ajax( { url: config.mongo.host + config.mongo.database + '/collections/constructorstandings?apiKey=' + config.mongo.apiKey,
            data: JSON.stringify(retVal),
            type: "POST",
            contentType: "application/json" 
          });
        }

        buildConstructorsChart(retVal)
      });
    } else {
      // console.log('defined')
      $scope.content_loaded = true;
      buildConstructorsChart($scope.data[0])
    }
  });

  function buildConstructorsChart(winDetails) {
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
  
  $scope.$watch("season", function( value ) {
      if (value >= 1950) {
        $state.go('constructors', {'season': value});
      }
  });
  $location.path('/' + $stateParams.season + '/constructors');
  $scope.$on('$viewContentLoaded', function(event) {
    // console.log('viewContentLoaded', $location.url())
    $window.ga('send', 'pageview', { page: $location.url() });
  });

});