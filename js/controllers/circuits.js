angular.module('formulaOneApp.controllers').controller('CircuitListController', function($scope, $rootScope, $state, $stateParams, $window, $location, Circuit) {
  var currentYear = new Date().getFullYear();
  if (!$stateParams.season || $stateParams.season > currentYear) $stateParams.season = currentYear;
  $rootScope.title = "Formula One Stats .:. " + $stateParams.season + " .:. Circuits";
  $scope.season = $stateParams.season;
  $scope.years = getYearRange();

  $scope.data = Circuit.mongo.query({season: $stateParams.season, series: 'f1'}, function() {
    var retVal = $scope.data[0]
    // console.log(retVal)
    if (typeof(retVal) == 'undefined') {
      $scope.data = Circuit.circuits.get({season: $stateParams.season, series: 'f1' }, function(){
        $scope.content_loaded = true;
        var retVal = $scope.data.MRData
        // console.log(retVal)
        $scope.circuits = retVal.CircuitTable
        retVal._id = $stateParams.season.toString()
        retVal.series = 'f1'
        // console.log(retVal)
        $.ajax( { url: config.mongo.host + config.mongo.database + '/collections/circuits?apiKey=' + config.mongo.apiKey,
          data: JSON.stringify( retVal),
          type: "POST",
          contentType: "application/json" 
        });
      });
    } else {
      $scope.content_loaded = true;
      // console.log('got from cache')
      $scope.circuits = retVal.CircuitTable
    }
  })

  $scope.$watch("season", function( value ) {
      if (value >= 1950) {
        $state.go('circuits', {'season': value});
      }
  });
  $location.path('/' + $stateParams.season + '/circuits');
  $scope.$on('$viewContentLoaded', function(event) {
    // console.log('viewContentLoaded', $location.url())
    $window.ga('send', 'pageview', { page: $location.url() });
  });

});