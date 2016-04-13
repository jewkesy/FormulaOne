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

  $scope.driverResults = Driver.results.get({ id: $stateParams.id, series: 'f1' }, function(response){
    $scope.driverResults.MRData.RaceTable.Races.reverse();

    var arrAvgSpeed = [];
    var avgPos = [];
    var avgGrid = [];
    var probFinishing = 0;
    var spdUnits = ''
    for (var i = 0; i < $scope.driverResults.MRData.RaceTable.Races.length; i++) {
      var x = $scope.driverResults.MRData.RaceTable.Races[i].Results[0];
      if (x.FastestLap && x.FastestLap.AverageSpeed && x.FastestLap.AverageSpeed.speed)  {
        x.FastestLap.AverageSpeed.speedMph = convertKphToMph(x.FastestLap.AverageSpeed.speed)
        arrAvgSpeed.push(x.FastestLap.AverageSpeed.speed);
        if (spdUnits.length == 0) spdUnits = x.FastestLap.AverageSpeed.units
      }

      avgPos.push(x.position);
      avgGrid.push(x.grid);
      if (x.status == "Finished") probFinishing++
    }

    $scope.avgGrid = Math.round(getAvgSum(avgGrid))
    $scope.avgPos = Math.round(getAvgSum(avgPos))
    $scope.avgSpeed = getAvgSum(arrAvgSpeed).toFixed(3) + ' ' + spdUnits;
    $scope.avgSpeedMph = convertKphToMph($scope.avgSpeed);
    $scope.probFinish = ((probFinishing/$scope.driverResults.MRData.RaceTable.Races.length) * 100).toFixed(2) + '%'

    // console.log($scope.avgSpeed, avgPos, avgGrid, probFinishing)
    // console.log($scope.driverResults)
  });

  function convertKphToMph(speedKph) {
    // 1kph= 0.6213712mph
    var retVal = speedKph.split(' ');

    if (retVal.length == 0 ) return ''

      var speedMph = 0
      speedMph = retVal[0]*0.6213712 


    return speedMph.toFixed(3) + ' mph';
  }

  function getAvgSum(arr) {
    var sum = 0;
    for( var i = 0; i < arr.length; i++ ){
        sum += parseInt( arr[i], 10 ); //don't forget to add the base
    }

    var avg = sum/arr.length;
    // console.log(avg)
    return avg
  }

  function buildDriver(driver) {
    // console.log(driver)
    if (driver.MRData.DriverTable.Drivers.length == 0) { $scope.no_data=true;return false;}
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