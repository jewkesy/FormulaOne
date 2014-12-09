var wikiApi = "http://en.wikipedia.org/w/api.php?callback=JSON_CALLBACK&format=json&action=query";

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
    var url = wikiApi + "&titles=" + driverName + "&prop=pageimages&pithumbsize=200";

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
    console.log(retVal)
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
    console.log($scope.data)
    var retVal = $scope.data.MRData.CircuitTable.Circuits[0];
    $scope.gMapUrl = "https://www.google.co.uk/maps/@52.7055818,-1.7753949,15z";

    var wikiUrl = retVal.url.split("/");
    wikiUrl = wikiUrl[wikiUrl.length - 1];

    retVal.wikiName = wikiUrl;

    $scope.getCircuitPic(wikiUrl);

    $scope.circuit = retVal
  }); //Get a single driver. Issues a GET to /api/driver/:id

  $scope.getCircuitPic = function(circuitName) {
    var url = wikiApi + "&titles=" + circuitName + "&prop=pageimages&pithumbsize=400";

    return $http.jsonp(url)
    .success(function(data){
        $.each(data.query.pages, function(i,item){
          $scope.circuit.imageUrl = item.thumbnail.source;
          return;
        });
    });
  };
});

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
