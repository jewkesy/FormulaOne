angular.module('formulaOneApp.controllers', [])
.controller('DriverListController', function($scope, $state, $stateParams, $window, $location, Driver) {
  if (!$stateParams.season) $stateParams.season = new Date().getFullYear();

  $scope.season = $stateParams.season;
  $scope.years = getYearRange();

  $scope.data = Driver.standings.get({season: $stateParams.season, series: 'f1' }, function(){
    var retVal = $scope.data.MRData.StandingsTable.StandingsLists[0]
    $scope.drivers = retVal
  }); //fetch all drivers. Issues a GET to /api/drivers

  $scope.$watch("season", function( value ) {
      if (value >= 1950) {
        $state.go('drivers', {'season': value});
      }
  });
  $location.path('/' + $stateParams.season + '/drivers');


}).controller('DriverViewController', function($scope, $http, $timeout, $stateParams, Driver) {
  $scope.data = Driver.driver.get({ id: $stateParams.id, series: 'f1' }, function(){
    var retVal = $scope.data.MRData.DriverTable.Drivers[0];
    var ageDifMs = Date.now() - new Date(retVal.dateOfBirth);
    var ageDate = new Date(ageDifMs); // miliseconds from epoch

    retVal.Age = Math.abs(ageDate.getUTCFullYear() - 1970);
    retVal.flagUrl = "http://jewkesy.github.io/colloquial/images/flags/" + retVal.nationality + ".png"

    var wikiUrl = retVal.url.split("/");
    wikiUrl = wikiUrl[wikiUrl.length - 1];

    retVal.wikiName = wikiUrl;

    $scope.getProfilePic(wikiUrl);

    $scope.driver = retVal
  }); //Get a single driver. Issues a GET to /api/driver/:id

  $scope.getProfilePic = function(driverName) {
    var url = config.wikiApi + "&titles=" + driverName + "&prop=pageimages&pithumbsize=" + config.picNarrowSize;

    return $http.jsonp(url)
    .success(function(data){
        $.each(data.query.pages, function(i,item){
          $scope.driver.imageUrl = item.thumbnail.source;
          return;
        });
    });
  };

}).controller('CircuitListController', function($scope, $state, $stateParams, $window, $location, Circuit) {
  if (!$stateParams.season) $stateParams.season = new Date().getFullYear();
  $scope.season = $stateParams.season;
  $scope.years = getYearRange();

  $scope.data = Circuit.circuits.get({season: $stateParams.season, series: 'f1' }, function(){
    var retVal = $scope.data.MRData.CircuitTable
    //console.log(retVal)
    $scope.circuits = retVal
  });

  $scope.$watch("season", function( value ) {
      if (value >= 1950) {
        $state.go('circuits', {'season': value});
      }
  });
  $location.path('/' + $stateParams.season + '/circuits');

}).controller('CircuitViewController', function($scope, $http, $timeout, $stateParams, Circuit) {
  $scope.data = Circuit.circuit.get({ id: $stateParams.id, series: 'f1' }, function(){
    //console.log($scope.data)
    var retVal = $scope.data.MRData.CircuitTable.Circuits[0];
    $scope.gMapUrl = "https://www.google.co.uk/maps/@52.7055818,-1.7753949,15z";

    var wikiUrl = retVal.url.split("/");
    wikiUrl = wikiUrl[wikiUrl.length - 1];

    retVal.wikiName = wikiUrl;

    $scope.getCircuitPic(wikiUrl);

    $scope.circuit = retVal
  });

  $scope.getCircuitPic = function(circuitName) {
    var url = config.wikiApi + "&titles=" + circuitName + "&prop=pageimages&pithumbsize=" + config.picWideSize;
    //console.log(url)
    return $http.jsonp(url)
    .success(function(data){
        $.each(data.query.pages, function(i,item){
          $scope.circuit.imageUrl = item.thumbnail.source;
          return;
        });
    });
  };

}).controller('ConstructorListController', function($scope, $state, $stateParams, $window, $location, Constructor) {
  if (!$stateParams.season) $stateParams.season = new Date().getFullYear();

  $scope.season = $stateParams.season;
  $scope.years = getYearRange();

  $scope.data = Constructor.standings.get({season: $stateParams.season, series: 'f1' }, function(){
    var retVal = $scope.data.MRData.StandingsTable.StandingsLists[0]
    //console.log(retVal)
    $scope.teams = retVal //NOTE constructor is a reserved AngularJs name!
  });

  $scope.$watch("season", function( value ) {
      if (value >= 1950) {
        $state.go('constructors', {'season': value});
      }
  });
  $location.path('/' + $stateParams.season + '/constructors');

}).controller('ConstructorViewController', function($scope, $http, $timeout, $stateParams, Constructor) {
  $scope.data = Constructor.constructor.get({ id: $stateParams.id, series: 'f1' }, function(){

    var retVal = $scope.data.MRData.StandingsTable;
    //console.log(retVal)
    var wikiUrl = retVal.StandingsLists[0].ConstructorStandings[0].Constructor.url.split("/");
    wikiUrl = wikiUrl[wikiUrl.length - 1];

    retVal.wikiName = wikiUrl;

    $scope.getConstructorPic(wikiUrl);

    $scope.team = retVal
  });

  $scope.getConstructorPic = function(constructorName) {
    var url = config.wikiApi + "&titles=" + constructorName + "&prop=pageimages&pithumbsize=" + config.picWideSize;
    //console.log(url)
    return $http.jsonp(url)
    .success(function(data){
        $.each(data.query.pages, function(i,item){
          $scope.team.imageUrl = item.thumbnail.source;
          return;
        });
    });
  };
}).controller('ResultViewController', function($scope, $http, $state, $stateParams, $window, $location, Result) {
  if (!$stateParams.season) $stateParams.season = new Date().getFullYear();
  $scope.season = $stateParams.season;
  $scope.years = getYearRange();
  $scope.round = $stateParams.round
  $scope.noRounds = 1;

  $scope.data = Result.round.get({season: $stateParams.season, series: 'f1', id: $stateParams.round }, function(){
    var retVal = $scope.data.MRData.RaceTable
    $scope.noRounds = $scope.data.MRData.total;
    if ($scope.noRounds == 0) {
      $state.go('viewResult', {'season': $scope.season, 'round': '1'});
    }
    $scope.rounds = (getRoundRange($scope.data.MRData.total));

    $scope.results = retVal
  });

  $scope.$watch("season", function( value ) {
      if (value >= 1950) {
        $state.go('viewResult', {'season': $scope.season, 'round': $scope.round});
      }
  });

  $scope.$watch("round", function( value ) {
      if (value > 0) {
        $state.go('viewResult', {'season': $scope.season, 'round': $scope.round});
      }
  })

  $location.path('/' + $stateParams.season + '/results/' +  $stateParams.round);

}).controller('ScheduleListController', function($scope, $state, $stateParams, $window, $location, Schedule) {
  if (!$stateParams.season) $stateParams.season = new Date().getFullYear();
  $scope.season = $stateParams.season;
  $scope.years = getYearRange();

  $scope.data = Schedule.schedule.get({season: $stateParams.season, series: 'f1' }, function(){
    var retVal = $scope.data.MRData.RaceTable
    $scope.schedule = retVal
  });

  $scope.$watch("season", function( value ) {
      if (value >= 1950) {
        $state.go('results', {'season': value});
      }
  });

  $location.path('/' + $stateParams.season + '/results');

}).filter('formatDateTime', [
  '$filter', function($filter) {
      return function(inputData) {
          //console.log(inputData.date)
          var retVal = new Date(inputData.date + 'T' + inputData.time).toUTCString();
          return retVal;
      };
  }
]);

function getYearRange() {
  var startYear = new Date().getFullYear();
  var endYear = 1950;
  var dateRange = [];

  while(endYear <= startYear) {
      dateRange.push(startYear);
      startYear -= 1
  }
  return dateRange;
}

function getRoundRange(noRounds) {
  var roundRange = [];

  for (i = 1; i <= noRounds; i++) {
      roundRange.push(i);
  }

  return roundRange;
}

function headerController($scope, $location) {
  $scope.isActive = function (viewLocation) {
    return $location.path().indexOf(viewLocation) >= 0;
  };
}
