angular.module('formulaOneApp.controllers').controller('ConstructorListController', function($scope, $rootScope, $state, $stateParams, $window, $location, Constructor) {
  var currentYear = new Date().getFullYear();
  if (!$stateParams.season || $stateParams.season > currentYear) $stateParams.season = currentYear;
  $rootScope.title = "Formula One Stats .:. " + $stateParams.season + " .:. Constructor Standings";
  $scope.season = $stateParams.season;
  $scope.years = getYearRange();

  $scope.data = Constructor.standings.get({season: $stateParams.season, series: 'f1' }, function(){
    $scope.content_loaded = true;
    var retVal = $scope.data.MRData.StandingsTable.StandingsLists[0]
    //console.log(retVal)
    $scope.teams = retVal //NOTE constructor is a reserved AngularJs name!

    var winDetails = {
      chartData: [[],[]],
      chartSeries: [],
      chartLabels: []
    }
// console.log(retVal)
    for (x = 0; x < retVal.ConstructorStandings.length; x++) {
      var win = retVal.ConstructorStandings[x]

      winDetails.chartLabels.push(win.Constructor.name)
      winDetails.chartSeries.push(win.Constructor.name)
      winDetails.chartData[0].push(win.points)
      winDetails.chartData[1].push(win.wins)
    }

    buildConstructorsChart(winDetails)
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