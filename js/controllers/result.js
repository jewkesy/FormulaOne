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
      // console.log(raceResults)
      if (typeof(raceResults[0]) == 'undefined') {
        // console.log('no details')
        raceResults = Result.race.get({season: $stateParams.season, series: 'f1', id: $stateParams.round }, function() {
          // console.log(raceResults)
          if (raceResults.MRData.total == 0) return deferred.resolve(raceResults);
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

  $q.all([getRaceResults(), getLapResults(1000, 0)]).then(function(data){  //, getPitResults()
    // console.log(data)
    var raceDetails = data[0].MRData

    if (raceDetails.total == 0) {
      $scope.content_loaded = true;
      
      return;
    }

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
    $scope.has_content = true;
    // console.log(data[1], data[2])
    buildLapsChart(data[1], data[2]);
  });

  function getPitResults() {
    if ($stateParams.season <= 2011) return $scope.chartLoaded = true;
    var deferred = $q.defer();
    var pitResults = Result.mongoPits.query({season: $stateParams.season, round: $stateParams.round, series: 'f1'}, function() {
      if (typeof(pitResults[0]) == 'undefined') {
        pitResults = Result.pits.get({season: $stateParams.season, series: 'f1', id: $stateParams.round }, function () {
          if (typeof(pitResults) == 'undefined') { return deferred.resolve(pitResults)}
          var retVal = pitResults.MRData.RaceTable.Races[0]
          if (typeof(retVal) == 'undefined') { return deferred.resolve(pitResults)}
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

  function getLapResults(limit, offset) {
    if ($stateParams.season < 1996) return $scope.chartLoaded = true;
    var deferred = $q.defer();
    var lapResults = Result.mongoLaps.query({season: $stateParams.season, round: $stateParams.round, series: 'f1'}, function() {    
      // console.log('mongo results', lapResults)
      if (typeof(lapResults[0]) == 'undefined') {
        // console.log('getting laps from live')

        lapResults = Result.laps.get({season: $stateParams.season, series: 'f1', id: $stateParams.round, limit: limit, offset: offset }, function () {
          // console.log('got laps from live')
          if (typeof(lapResults) == 'undefined') {console.log('empty live data'); return deferred.resolve(lapResults)}
          // console.log(lapResults.MRData)

          // if (lapResults.MRData.total <= limit) return deferred.resolve(lapResults)
          // console.log('getting page 2')
          var page2 = Result.laps.get({season: $stateParams.season, series: 'f1', id: $stateParams.round, limit: limit, offset: limit }, function () {
            // console.log('got page 2')
            // console.log(typeof page2.MRData.RaceTable.Races[0])
            // console.log(typeof page2.MRData.RaceTable.Races[0].Laps)

            // need to merge the results where the limit would cut off

            // console.log(lapResults.MRData.RaceTable.Races[0].Laps[lapResults.MRData.RaceTable.Races[0].Laps.length-1].number, page2.MRData.RaceTable.Races[0].Laps[0].number)
            if (typeof page2.MRData.RaceTable.Races[0] != 'undefined') {
              if (lapResults.MRData.RaceTable.Races[0].Laps[lapResults.MRData.RaceTable.Races[0].Laps.length-1].number == page2.MRData.RaceTable.Races[0].Laps[0].number) {
                // for (var i = 0; i < page2.MRData.RaceTable.Races[0].Laps.length; i++) {
                  for (var j  = 0; j < page2.MRData.RaceTable.Races[0].Laps[0].Timings.length; j++) {
                    lapResults.MRData.RaceTable.Races[0].Laps[lapResults.MRData.RaceTable.Races[0].Laps.length-1].Timings.push(page2.MRData.RaceTable.Races[0].Laps[0].Timings[j])
                  }
                // }
              }
              // now skip first
              for (var i = 1; i < page2.MRData.RaceTable.Races[0].Laps.length; i++) {
                lapResults.MRData.RaceTable.Races[0].Laps.push(page2.MRData.RaceTable.Races[0].Laps[i])
              }
            }

            var retVal = lapResults
            // console.log(retVal.MRData.RaceTable.Races[0].Laps)
            $scope.circuits = retVal.CircuitTable
            retVal._id = $stateParams.season + $stateParams.round
            retVal.series = 'f1'
            retVal.season = $stateParams.season
            retVal.round = $stateParams.round

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
             // return deferred.resolve(retVal)
            $.ajax( { url: config.mongo.host + config.mongo.database + '/collections/laps?apiKey=' + config.mongo.apiKey,
              data: JSON.stringify(retVal),
              type: "POST",
              contentType: "application/json" 
            });
            return deferred.resolve(retVal)
          })
        })
      } else {
        return deferred.resolve(lapResults[0])
      }
    });
    return deferred.promise
  }

  function buildLapsChart(lapDetails, pitDetails) {
    // console.log(lapDetails, pitDetails)
    // if (typeof(lapDetails) == 'undefined' || typeof(pitDetails) == 'undefined') return;
    if (typeof(lapDetails) == 'undefined') return;
    var width = $window.innerWidth

    var chartData = [lapDetails.chartData]
    // var chartData = [lapDetails.chartData, pitDetails.chartData]
  
    if (width <= 400) {
      $scope.chartOptions = {legend: true, scaleUse2Y: false, animation: false, datasetFill: false}
    } else if (width <= 1024) {
      $scope.chartOptions = {legend: true, scaleUse2Y: false, animation: false, animationStep: 5, datasetFill: false}
    } else {  
      $scope.chartOptions = {legend: true, scaleUse2Y: false, animation: false}
    }

    $scope.chartLabels = lapDetails.chartLabels;
    $scope.chartData = lapDetails.chartData;
    $scope.series = lapDetails.chartSeries;

    // $scope.onClick = function (points, evt) {
    //   // console.log(points, evt);
    // };
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