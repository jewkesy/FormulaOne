angular.module('formulaOneApp.controllers', [])
.controller('DriverListController', function($scope, $state, $stateParams, $window, Driver) {
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
  //  console.log(driverName)
    var url = "http://en.wikipedia.org/w/api.php?callback=JSON_CALLBACK&action=query&titles=" + driverName + "&prop=pageimages&format=json&pithumbsize=200";

    return $http.jsonp(url)
    .success(function(data){
        $.each(data.query.pages, function(i,item){
          //return "http://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Lewis_Hamilton_October_2014.jpg/72px-Lewis_Hamilton_October_2014.jpg"
          $scope.driver.imageUrl = item.thumbnail.source;
          return;
        });
    });
  };
}).controller('CircuitListController', function($scope, $state, $stateParams, $window, Circuits) {
  if (!$stateParams.season) $stateParams.season = new Date().getFullYear();
  $scope.season = $stateParams.season;
  $scope.years = getYearRange();

  $scope.data = Circuits.circuits.get({season: $stateParams.season, series: 'f1' }, function(){
    var retVal = $scope.data.MRData.CircuitTable
    $scope.circuits = retVal
  });

  $scope.$watch("season", function( value ) {
      if (value >= 1950) {
        $state.go('circuits', {'season': value});
      }
  });
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
