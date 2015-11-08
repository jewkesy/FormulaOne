angular.module('formulaOneApp.controllers').controller('DriverViewController', function($scope, $rootScope, $http, $timeout, $stateParams, $location, $window, Driver) {
  $scope.$on('$viewContentLoaded', function(event) {
    // console.log('viewContentLoaded', $location.url())
    $window.ga('send', 'pageview', { page: $location.url() });
  });

  $scope.data = Driver.mongo.query({ id: $stateParams.id, series: 'f1' }, function(response){
    // console.log($scope.data)
    if (typeof($scope.data[0]) == 'undefined') {
      // console.log('could not find cache for ' + $stateParams.id)
      $scope.data = Driver.driver.get({ id: $stateParams.id, series: 'f1' }, function(response){
        var retVal = $scope.data
        // console.log(retVal)
        retVal._id = $stateParams.id
        retVal.series = 'f1'
        // console.log(retVal)
        $.ajax( { url: config.mongo.host + config.mongo.database + '/collections/drivers?apiKey=' + config.mongo.apiKey,
          data: JSON.stringify( retVal),
          type: "POST",
          contentType: "application/json" 
        });
        buildDriver(retVal)
      });
    } else {
      // console.log('got driver from mongo')
      buildDriver($scope.data[0])
    }

  });

  function buildDriver(driver) {
    // console.log(driver)
    $scope.content_loaded = true;
    var retVal = driver.MRData.DriverTable.Drivers[0];

    $rootScope.title = "Formula One Stats .:. Driver .:. " + retVal.givenName + ' ' + retVal.familyName;

    var ageDifMs = Date.now() - new Date(retVal.dateOfBirth);
    var ageDate = new Date(ageDifMs); // miliseconds from epoch

    retVal.Age = Math.abs(ageDate.getUTCFullYear() - 1970);
    retVal.flagUrl = config.flagsUrl + retVal.nationality + ".png"

    var wikiUrl = retVal.url.split("/");
    wikiUrl = wikiUrl[wikiUrl.length - 1];

    retVal.wikiName = wikiUrl;

    $scope.getProfilePic(wikiUrl);

    $scope.driver = retVal
  }

  $scope.getProfilePic = function(driverName) {
    var url = config.wikiApi + driverName + "&pithumbsize=" + config.picNarrowSize;

    return $http.jsonp(url)
    .success(function(data){
        $.each(data.query.pages, function(i,item){
          $scope.driver.imageUrl = item.thumbnail.source;
          return;
        });
    });
  };

})