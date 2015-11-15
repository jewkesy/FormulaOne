angular.module('formulaOneApp.controllers').controller('ResultViewController', function($scope, $rootScope, $http, $q, $state, $stateParams, $window, $location, Result) {
  var currentYear = new Date().getFullYear();
  if (!$stateParams.season || $stateParams.season > currentYear) $stateParams.season = currentYear;

  $scope.season = $stateParams.season;
  $scope.years = getYearRange();
  $scope.round = $stateParams.round
  $scope.noRounds = 1;

  var driverList = Result.cacheDriverList.get({}, function() {
    driverList = driverList.MRData.DriverTable.Drivers
  });

  function getRaceResults() {
    var deferred = $q.defer();
    var raceResults = Result.mongoResults.query({season: $stateParams.season, round: $stateParams.round, series: 'f1'}, function() {
      if (typeof(raceResults[0]) == 'undefined') {
        raceResults = Result.race.get({season: $stateParams.season, series: 'f1', id: $stateParams.round }, function() {
          if (typeof(raceResults.MRData.RaceTable.Races[0]) == 'undefined') return;
          var retVal = raceResults
          retVal._id = $stateParams.season + $stateParams.round
          retVal.series = 'f1'

          // console.log('results live')
          $.ajax( { url: config.mongo.host + config.mongo.database + '/collections/results?apiKey=' + config.mongo.apiKey,
            data: JSON.stringify(retVal),
            type: "POST",
            contentType: "application/json" 
          });
           return deferred.resolve(retVal)
        });
      } else {
      // console.log('results cache')
      return deferred.resolve(raceResults[0])
    }
    });
    return deferred.promise
  }

  $q.all([getRaceResults(), getLapResults(), getPitResults()]).then(function(data){
    // console.log(data)
    var raceDetails = data[0].MRData

    $rootScope.title = "Formula One Stats .:. " + $stateParams.season + " .:. Round " + raceDetails.RaceTable.round + " .:. " + raceDetails.RaceTable.Races[0].raceName;

    $scope.noRounds = raceDetails.total;
    if ($scope.noRounds == 0) {
      $state.go('viewResult', {'season': $scope.season, 'round': '1'});
    }
    $scope.rounds = (getRoundRange($scope.noRounds));

    setStatData(raceDetails.RaceTable)

    var retVal = raceDetails.RaceTable

    $scope.results = retVal

    $scope.content_loaded = true;
    buildLapsChart(data[1], data[2]);
  });

  function getPitResults() {
    var deferred = $q.defer();
    var pitResults = Result.mongoPits.query({season: $stateParams.season, round: $stateParams.round, series: 'f1'}, function() {
      if (typeof(pitResults[0]) == 'undefined') {
        pitResults = Result.pits.get({season: $stateParams.season, series: 'f1', id: $stateParams.round }, function () {
          if (typeof(pitResults) == 'undefined') { $scope.content_empty=true; return deferred.resolve(pitResults)}
          var retVal = pitResults.MRData.RaceTable.Races[0]
          if (typeof(retVal) == 'undefined') { $scope.content_empty=true; return deferred.resolve(pitResults)}
          retVal._id = $stateParams.season + $stateParams.round
          retVal.series = 'f1'

          retVal.chartLabels = []
          retVal.chartSeries = []
          retVal.chartData = []

          // console.log(retVal)
          var pitDetails = retVal.PitStops
          var pitTimes=[];
          for (var i = 0; i < pitDetails.length; i++) {
            // console.log(pitDetails[i])
            // retVal.chartLabels.push(pitDetails[i].driverId)
            var pit = pitDetails[i]
   
            var idx = keyExists(pit.driverId, pitTimes)
            if (idx == -1) {
              pitTimes.push({
                key: pit.driverId,
                code: getDriverCode(pit.driverId, driverList),
                timings: [{
                  lap: pit.lap,
                  time: pit.duration
                }]
              })
            } else {
              pitTimes[idx].timings.push({time: pit.duration})
            }  

          }  
        // console.log(pitTimes)
          for (x = 0; x < pitTimes.length; x++) {
            retVal.chartSeries.push(pitTimes[x].code)
            var times = []
            for (y = 0; y < pitTimes[x].timings.length; y++) {
              times.push(convertToSecs(pitTimes[x].timings[y].time))
            }
            retVal.chartData.push(times)
          }

      
          $.ajax( { url: config.mongo.host + config.mongo.database + '/collections/pits?apiKey=' + config.mongo.apiKey,
            data: JSON.stringify(retVal),
            type: "POST",
            contentType: "application/json" 
          });
          // console.log('pit live')
          return deferred.resolve(retVal)
        });
      } else {
        // console.log('pit cache')
        return deferred.resolve(pitResults[0])
      }
    });
    return deferred.promise
  }

  function getLapResults() {
    var deferred = $q.defer();
    var lapResults = Result.mongoLaps.query({season: $stateParams.season, round: $stateParams.round, series: 'f1'}, function() {    
    if (typeof(lapResults[0]) == 'undefined') {
      lapResults = Result.laps.get({season: $stateParams.season, series: 'f1', id: $stateParams.round }, function () {
        if (typeof(lapResults) == 'undefined') { $scope.content_empty=true; return deferred.resolve(lapResults)}
        var retVal = lapResults
        if ( typeof(lapResults.MRData.RaceTable.Races[0]) == 'undefined') { $scope.content_empty=true; return deferred.resolve(retVal)};
        $scope.circuits = retVal.CircuitTable
        retVal._id = $stateParams.season + $stateParams.round
        retVal.series = 'f1'

        retVal.chartLabels = []
        retVal.chartSeries = []
        retVal.chartData = []

        var lapDetails = lapResults.MRData.RaceTable.Races[0].Laps
        var lapTimes=[];
        for (var i = 0; i < lapDetails.length; i++) {
          retVal.chartLabels.push(lapDetails[i].number)
          var lap = lapDetails[i].Timings
          for (var j = 0; j < lap.length; j++){
            var idx = keyExists(lap[j].driverId, lapTimes)
            if (idx == -1) {
              lapTimes.push({
                key: lap[j].driverId,
                code: getDriverCode(lap[j].driverId, driverList),
                timings: [{
                  time: lap[j].time
                }]
              })
            } else {
              lapTimes[idx].timings.push({time: lap[j].time})
            }  
          }
        }  

        for (x = 0; x < lapTimes.length; x++) {
          retVal.chartSeries.push(lapTimes[x].code)
          var times = []
          for (y = 0; y < lapTimes[x].timings.length; y++) {
            times.push(convertToSecs(lapTimes[x].timings[y].time))
          }
          retVal.chartData.push(times)
        }

        // retVal.MRData = ""

        $.ajax( { url: config.mongo.host + config.mongo.database + '/collections/laps?apiKey=' + config.mongo.apiKey,
          data: JSON.stringify( retVal),
          type: "POST",
          contentType: "application/json" 
        });
        return deferred.resolve(retVal)
      })
    } else {
      return deferred.resolve(lapResults[0])
    }
  });
  return deferred.promise
}

  function buildLapsChart(lapDetails, pitDetails) {
    // console.log(lapDetails ,pitDetails)
    if (typeof(lapDetails) == 'undefined' || typeof(pitDetails) == 'undefined') return;
    var width = $window.innerWidth

    var chartData = [lapDetails.chartData]
    // var chartData = [lapDetails.chartData, pitDetails.chartData]

    if (width <= 400) {
      // $scope.chartData =  sortAndSplice(lapDetails.chartData, 50);
      // $scope.series =     sortAndSplice(lapDetails.chartSeries, 50);
      $scope.chartOptions = {legend: true, scaleUse2Y: false, animation: false, datasetFill: false}
    } else if (width <= 1024) {
      // $scope.chartData =  sortAndSplice(lapDetails.chartData, 50);
      // $scope.series =     sortAndSplice(lapDetails.chartSeries, 50);
      $scope.chartOptions = {legend: true, scaleUse2Y: false, animation: false, animationStep: 5, datasetFill: false}
    } else {  
      // $scope.chartData = lapDetails.chartData;
      // $scope.series = lapDetails.chartSeries;
      $scope.chartOptions = {legend: true, scaleUse2Y: false, animation: false}
    }

    $scope.chartLabels = lapDetails.chartLabels;
    $scope.chartData = lapDetails.chartData;
    $scope.series = lapDetails.chartSeries;

    $scope.onClick = function (points, evt) {
      // console.log(points, evt);
    };
    $scope.$on('create', function () {
       $scope.chartLoaded = true;
    });
  }

  function sortAndSplice(arr, size) {
    return arr.slice(0, size);
  }

  $scope.$watch("season", function( value ) {
    if (value >= 1950) $state.go('viewResult', {'season': $scope.season, 'round': 1});
  });

  $scope.$watch("round", function( value ) {
    if (value > 0) $state.go('viewResult', {'season': $scope.season, 'round': $scope.round});
  })

  $location.path('/' + $stateParams.season + '/results/' +  $stateParams.round);
  $scope.$on('$viewContentLoaded', function(event) {
    $window.ga('send', 'pageview', { page: $location.url() });
  });

})