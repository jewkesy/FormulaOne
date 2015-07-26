angular.module('formulaOneApp.controllers', ['ngSanitize'])
.controller('HeaderController', function($scope, $location) {
  $scope.isActive = function (viewLocation) {
    return $location.path().indexOf(viewLocation) >= 0;
  };
}).controller('FooterController', function($scope) {
  $scope.currentDate = new Date();
}).controller('NewsController', function($scope, $location, $sce, $http, News) {

  $http.jsonp(config.googleNews)
    .success(function(data){
      $scope.content_loaded = true;
      
      var retVal = prepStuff(data.responseData.results);

      //console.log(retVal)
      $scope.results = retVal;
    });

  $location.path('/news');

}).controller('DriverListController', function($scope, $rootScope, $state, $stateParams, $window, $location, Driver) {
  if (!$stateParams.season) $stateParams.season = config.defaultYear;
  $rootScope.title = "Formula One Stats .:. " + $stateParams.season + " .:. Driver Standings";
  $scope.season = $stateParams.season;
  $scope.years = getYearRange();

  $scope.data = Driver.standings.get({season: $stateParams.season, series: 'f1' }, function(){
    // console.log($scope.data)
    $scope.content_loaded = true;
    var retVal = $scope.data.MRData.StandingsTable.StandingsLists[0]
    $scope.drivers = retVal
  }); //fetch all drivers. Issues a GET to /api/drivers

  $scope.$watch("season", function( value ) {
      if (value >= 1950) {
        $state.go('drivers', {'season': value});
      }
  });
  $location.path('/' + $stateParams.season + '/drivers');

}).controller('DriverViewController', function($scope, $rootScope, $http, $timeout, $stateParams, Driver) {
  //console.log($stateParams)

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

}).controller('CircuitListController', function($scope, $rootScope, $state, $stateParams, $window, $location, Circuit) {
  if (!$stateParams.season) $stateParams.season = config.defaultYear;
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
        console.log(retVal)
        $scope.circuits = retVal.CircuitTable
        retVal._id = $stateParams.season
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

}).controller('CircuitViewController', function($scope, $rootScope, $http, $sce, $timeout, $stateParams, Circuit) {
  $scope.data = Circuit.circuit.get({ id: $stateParams.id, series: 'f1' }, function(){
    $scope.content_loaded = true;
    var retVal = $scope.data.MRData.CircuitTable.Circuits[0];
    $rootScope.title = "Formula One Stats .:. Circuits .:. " + retVal.circuitName;
    $scope.gMapUrl = "https://www.google.co.uk/maps/@52.7055818,-1.7753949,15z";

    var wikiUrl = retVal.url.split("/");
    wikiUrl = wikiUrl[wikiUrl.length - 1];

    retVal.wikiName = wikiUrl;

    $scope.getCircuitPic(wikiUrl);
    $scope.getCircuitDetails(wikiUrl);
    $scope.circuit = retVal
  });

  $scope.getCircuitPic = function(circuitName) {
    var url = config.wikiApi + circuitName + "&pithumbsize=" + getImageWidth();
    //console.log(url)
    return $http.jsonp(url)
    .success(function(data){
        $.each(data.query.pages, function(i,item){
          //console.log(item)
          $scope.circuit.imageUrl = item.thumbnail.source;
          return;
        });
    });
  };

  $scope.getCircuitDetails = function(circuitName) {
    var url = "http://en.wikipedia.org/w/api.php?action=parse&prop=text&section=0&format=json&callback=JSON_CALLBACK&page=" + circuitName;
    //console.log(url)
    return $http.jsonp(url)
    .success(function(data){
      //console.log(data.parse.text);
      $.each(data.parse.text, function(i,item){
        // console.log(item)
        $scope.circuit.details = $sce.trustAsHtml(parseXWiki(item));
        return;
      });
    });
  };

}).controller('ConstructorListController', function($scope, $rootScope, $state, $stateParams, $window, $location, Constructor) {
  if (!$stateParams.season) $stateParams.season = config.defaultYear;
  $rootScope.title = "Formula One Stats .:. " + $stateParams.season + " .:. Constructor Standings";
  $scope.season = $stateParams.season;
  $scope.years = getYearRange();

  $scope.data = Constructor.standings.get({season: $stateParams.season, series: 'f1' }, function(){
    $scope.content_loaded = true;
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

}).controller('ConstructorViewController', function($scope, $rootScope, $http, $timeout, $stateParams, Constructor) {

  $scope.data = Constructor.mongo.query({ id: $stateParams.id, series: 'f1' }, function(response){
    // console.log($scope.data)
    if (typeof($scope.data[0]) == 'undefined') {
      $scope.data = Constructor.constructor.get({ id: $stateParams.id, series: 'f1' }, function(response){
        var retVal = $scope.data
        // console.log(retVal)
        retVal._id = $stateParams.id
        retVal.series = 'f1'
        // console.log(retVal)
        $.ajax( { url: config.mongo.host + config.mongo.database + '/collections/constructors?apiKey=' + config.mongo.apiKey,
          data: JSON.stringify( retVal),
          type: "POST",
          contentType: "application/json" 
        });
        buildConstructor(retVal)
      });
    } else {
      // console.log('got constructor from mongo')
      buildConstructor($scope.data[0])
    }
  });

  function buildConstructor(constructor) {
    $scope.content_loaded = true;
    var retVal = constructor.MRData.StandingsTable;
    $rootScope.title = "Formula One Stats .:. Constructors .:. " + retVal.StandingsLists[0].ConstructorStandings[0].Constructor.name;
    //console.log(retVal)
    var wikiUrl = retVal.StandingsLists[0].ConstructorStandings[0].Constructor.url.split("/");
    wikiUrl = wikiUrl[wikiUrl.length - 1];

    retVal.wikiName = wikiUrl;

    $scope.getConstructorPic(wikiUrl);

    $scope.team = retVal
  }

  $scope.getConstructorPic = function(constructorName) {
    var url = config.wikiApi + constructorName + "&pithumbsize=" + getImageWidth();
    //console.log(url)
    return $http.jsonp(url)
    .success(function(data){
        $.each(data.query.pages, function(i,item){
          $scope.team.imageUrl = item.thumbnail.source;
          return;
        });
    });
  };
}).controller('ResultViewController', function($scope, $rootScope, $http, $q, $state, $stateParams, $window, $location, Result) {
  if (!$stateParams.season) $stateParams.season = config.defaultYear;

  $scope.season = $stateParams.season;
  $scope.years = getYearRange();
  $scope.round = $stateParams.round
  $scope.noRounds = 1;

  var driverList = Result.cacheDriverList.get({}, function() {
    driverList = driverList.MRData.DriverTable.Drivers
  });

  // var raceResults = getRaceResults();

  var raceResults = Result.race.get({season: $stateParams.season, series: 'f1', id: $stateParams.round }, function() {});
  var qualResults = Result.qualifying.get({season: $stateParams.season, series: 'f1', id: $stateParams.round }, function () {});

  var lapResults = Result.mongoLaps.query({season: $stateParams.season, round: $stateParams.round, series: 'f1'}, function() {
    if (typeof(lapResults[0]) == 'undefined') {
      lapResults = Result.laps.get({season: $stateParams.season, series: 'f1', id: $stateParams.round }, function () {
        var retVal = lapResults
        if ( typeof(lapResults.MRData.RaceTable.Races[0]) == 'undefined') return;
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

        // console.log(retVal)
        retVal.MRData = ""
        // console.log(retVal)

        $.ajax( { url: config.mongo.host + config.mongo.database + '/collections/laps?apiKey=' + config.mongo.apiKey,
          data: JSON.stringify( retVal),
          type: "POST",
          contentType: "application/json" 
        });

        buildLapsChart(retVal)
      })
    } else {
      // console.log(lapResults[0])
      buildLapsChart(lapResults[0])
    }
  });


  $q.all([raceResults.$promise, qualResults.$promise]).then(function(data){
    // console.log(data)
    var raceDetails = data[0].MRData
    var qualDetails = data[1].MRData
    // var lapDetails =  data[2].MRData.RaceTable.Races[0].Laps
    // console.log(lapDetails)

    if (raceDetails.RaceTable.Races.length == 0) {
      raceDetails.RaceTable.Races = [{raceName : "TBA"}];
    }
    $rootScope.title = "Formula One Stats .:. " + $stateParams.season + " .:. Round " + raceDetails.RaceTable.round + " .:. " + raceDetails.RaceTable.Races[0].raceName;

    $scope.noRounds = raceDetails.total;
    if ($scope.noRounds == 0) {
      $state.go('viewResult', {'season': $scope.season, 'round': '1'});
    }
    $scope.rounds = (getRoundRange($scope.noRounds));

    var retVal = mergeDriverRaceQualDetails(raceDetails.RaceTable, qualDetails);

    $scope.results = retVal
    
    $scope.content_loaded = true;
  });

  function getRaceResults(){

    return $q(function(resolve, reject) {
    setTimeout(function() {
      if (getStuff('Daryl')) {
        resolve('Hello, ' + name + '!');
      } else {
        reject('Greeting ' + name + ' is not allowed.');
      }
    }, 1000);
  });


    // var d = $q.defer();
    // getStuff('param',function(err,data){
    //      if(err !== null) return d.reject(err); // `throw err` also works here.
    //          d.resolve(data);
    // });
    // return d.promise;   
  }
  function getStuff(stuff) {
    setTimeout(function(){ return stuff; }, 110);
  }

  function getRaceResultsMaster() {

    var deferred = $q.defer();
    var results = Result.mongoResults.query({season: $stateParams.season, round: $stateParams.round, series: 'f1'}, function() {
    
      console.log(results[0])
      if (typeof(results[0]) == 'undefined') {
        results = Result.race.get({season: $stateParams.season, series: 'f1', id: $stateParams.round }, function() {
          results._id = $stateParams.season + $stateParams.round
          results.series = 'f1'
          console.log(results)
          // $.ajax( { url: config.mongo.host + config.mongo.database + '/collections/results?apiKey=' + config.mongo.apiKey,
          //   data: JSON.stringify( retVal),
          //   type: "POST",
          //   contentType: "application/json" 
          // });
        raceResults = results;
           return deferred.resolve(raceResults);
           return deferred.promise();
        });
      } else {
        console.log('got results from cache')
        raceResults = results;
         return deferred.resolve(raceResults)
         return deferred.promise();
      }
    })
  }

  function buildLapsChart(lapDetails) {
    $scope.chartLabels = lapDetails.chartLabels;
    $scope.chartData = lapDetails.chartData;
    $scope.series = lapDetails.chartSeries;
    $scope.options = {datasetFill : false}
    
    $scope.onClick = function (points, evt) {
      // console.log(points, evt);
    };
  }

  function convertToSecs(timing) {
    var parts = timing.split(':')
    var retVal = (Number(parts[0]*60) + Number(parts[1])).toFixed(3)
    return retVal
  }

  function keyExists(name, arr) {
    for (var i = 0; i < arr.length; i++) {
      if( arr[ i ].key === name ) return i;
    }
    return -1;
  }

  function getDriverCode(driverId, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].driverId == driverId) return arr[i].code
    }
    return driverId
  }

  function mergeDriverRaceQualDetails(raceDetails, qualDetails) {
    // TODO look to include qualifying data here
    return raceDetails
  }

  $scope.$watch("season", function( value ) {
      if (value >= 1950) {
        $state.go('viewResult', {'season': $scope.season, 'round': 1});
      }
  });

  $scope.$watch("round", function( value ) {
      if (value > 0) {
        $state.go('viewResult', {'season': $scope.season, 'round': $scope.round});
      }
  })

  $location.path('/' + $stateParams.season + '/results/' +  $stateParams.round);

}).controller('ScheduleListController', function($scope, $rootScope, $state, $stateParams, $window, $location, Schedule, Weather) {
  if (!$stateParams.season) $stateParams.season = config.defaultYear;
  $rootScope.title = "Formula One Stats .:. " + $stateParams.season + " .:. Race Schedule";
  $scope.season = $stateParams.season;
  $scope.years = getYearRange();
  var d = new Date();
  $scope.currentDate = d.getFullYear() + '-' + ('0' + (d.getMonth()+1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);

  $scope.data = Schedule.mongo.query({season: $stateParams.season, series: 'f1'}, function() {
    var retVal = $scope.data[0]
    if (typeof(retVal) == 'undefined') {
       $scope.data = Schedule.schedule.get({season: $stateParams.season, series: 'f1' }, function(){
        var retVal = $scope.data.MRData.RaceTable
        retVal._id = $stateParams.season
        retVal.series = 'f1'

        $.ajax( { url: config.mongo.host + config.mongo.database + '/collections/schedule?apiKey=' + config.mongo.apiKey,
          data: JSON.stringify( retVal),
          type: "POST",
          contentType: "application/json" 
        });

        $scope.schedule = retVal
        buildSchedulePage()
        
      });
    } else {
      $scope.schedule = retVal
      buildSchedulePage()
    }
  });

  function buildSchedulePage() {
    // console.log('Building schedule page')
    $scope.content_loaded = true;
    var retVal = $scope.schedule 
    var today = new Date();
        today.setDate(today.getDate());
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if (dd < 10) dd = '0' + dd
        if (mm < 10) mm = '0' + mm 

        today = yyyy+'-'+mm+'-'+dd;
        var currDate = new Date(today).getTime();
        if (yyyy != $stateParams.season) { $scope.hideNextRace = true; return false;}

        for (var i = 0; i < retVal.Races.length; i++) {
          var strDateTime = retVal.Races[i].date;
          var raceDate = new Date(strDateTime);
          var raceUnixTme = raceDate.getTime();
          
          if (raceUnixTme >= currDate) {

            retVal.Races[i].upcoming = true;
            $scope.nextRace = retVal.Races[i];

            var circuit = retVal.Races[i];
            var daysDifference = Math.floor((raceUnixTme - currDate)/1000/60/60/24); 

            if (daysDifference == 0) {
              $scope.timeToRace = ' today!'
            } else if (daysDifference == 1) {
              $scope.timeToRace = ' tomorrow!'
            } else {
              $scope.timeToRace = daysDifference + 1 + ' days away'
            }

            if (daysDifference > 4 && daysDifference <= 16) { //+2 is used to account for day difference
              $scope.weather = Weather.extended.get({latitude: circuit.Circuit.Location.lat, longitude: circuit.Circuit.Location.long, days: daysDifference + 2, units: "metric"}, function(){
                $scope.weatherForecast = $scope.weather.list[(daysDifference + 2) - 1]
                $scope.weatherForecast.desc = "Extended Forecast"
                $scope.weatherForecast.dateText = raceDate.toDateString();;
                $scope.weatherForecast.temp.day = Math.round($scope.weatherForecast.temp.day)
                $scope.weatherForecast.temp.min = Math.round($scope.weatherForecast.temp.min)
                $scope.weatherForecast.temp.max = Math.round($scope.weatherForecast.temp.max)

                $scope.weatherForecast.icon = config.weatherIcons + $scope.weatherForecast.weather[0].icon + '.png'
                $scope.weatherForecast.WindIcon = config.weatherIcons + 'arrow.png'
                $scope.weatherForecast.windMph =  Math.round($scope.weatherForecast.speed * 2.2369)

                $scope.weatherForecast.cloud = config.weatherIcons + '03d.png'

                $scope.weather_loaded = true;
              })
            } else {
              $scope.weather = Weather.forecast.get({latitude: circuit.Circuit.Location.lat, longitude: circuit.Circuit.Location.long, days: 0, units: "metric"}, function(){

                pracDate = (new Date(retVal.Races[i].date + 'T' + retVal.Races[i].time)/1000) - (86400*2)
                qualDate = (new Date(retVal.Races[i].date + 'T' + retVal.Races[i].time)/1000) - 86400
                raceUnixTme = (new Date(retVal.Races[i].date + 'T' + retVal.Races[i].time)/1000)

                var list = $scope.weather.list
                
                var theWeather = '';
                for (var x = 0; x < list.length; x++) {

                  if (list[x].dt >= raceUnixTme) {
                    $scope.weatherForecast = list[x]
                    $scope.weatherForecast.desc = "Current Forecast"
                    var theDate = raceDate.toDateString();
                    $scope.weatherForecast.dateText = theDate.substring(0, theDate.length - 4);
                    $scope.weatherForecast.dateTextSuper = ""
                    $scope.weatherForecast.temp = {}
                    $scope.weatherForecast.temp.day = Math.round($scope.weatherForecast.main.temp)
                    $scope.weatherForecast.temp.min = Math.round($scope.weatherForecast.main.temp_min)
                    $scope.weatherForecast.temp.max = Math.round($scope.weatherForecast.main.temp_max)

                    $scope.weatherForecast.icon = config.weatherIcons + $scope.weatherForecast.weather[0].icon + '.png'
                    $scope.weatherForecast.WindIcon = config.weatherIcons + 'arrow.png'
                    $scope.weatherForecast.windMph =  Math.round($scope.weatherForecast.wind.speed * 2.2369)
                    $scope.weatherForecast.deg = $scope.weatherForecast.wind.deg

                    $scope.weatherForecast.cloud = config.weatherIcons + '03d.png'
                    $scope.weatherForecast.clouds = $scope.weatherForecast.clouds.all
                    $scope.weather_loaded = true;

                    if (x > 8) {
                      $scope.qualForecast = list[x-8]
                      raceDate.setDate(raceDate.getDate() - 1);
                      var theDate = raceDate.toDateString();
                      $scope.qualForecast.dateText = theDate.substring(0, theDate.length - 4);
                      $scope.qualForecast.temp = {}
                      $scope.qualForecast.temp.day = Math.round($scope.qualForecast.main.temp)
                      $scope.qualForecast.temp.min = Math.round($scope.qualForecast.main.temp_min)
                      $scope.qualForecast.temp.max = Math.round($scope.qualForecast.main.temp_max)

                      $scope.qualForecast.icon = config.weatherIcons + $scope.qualForecast.weather[0].icon + '.png'
                      $scope.qualForecast.WindIcon = config.weatherIcons + 'arrow.png'
                      $scope.qualForecast.windMph =  Math.round($scope.qualForecast.wind.speed * 2.2369)
                      $scope.qualForecast.deg = $scope.qualForecast.wind.deg

                      $scope.qualForecast.cloud = config.weatherIcons + '03d.png'
                      $scope.qualForecast.clouds = $scope.qualForecast.clouds.all

                      $scope.qualForecast_loaded = true;
                    }
                    
                    if (x > 16) {
                      $scope.pracForecast = list[x-16]
                      raceDate.setDate(raceDate.getDate() - 1);
                      var theDate = raceDate.toDateString();
                      $scope.pracForecast.dateText = theDate.substring(0, theDate.length - 4);
                      $scope.pracForecast.temp = {}
                      $scope.pracForecast.temp.day = Math.round($scope.pracForecast.main.temp)
                      $scope.pracForecast.temp.min = Math.round($scope.pracForecast.main.temp_min)
                      $scope.pracForecast.temp.max = Math.round($scope.pracForecast.main.temp_max)

                      $scope.pracForecast.icon = config.weatherIcons + $scope.pracForecast.weather[0].icon + '.png'
                      $scope.pracForecast.WindIcon = config.weatherIcons + 'arrow.png'
                      $scope.pracForecast.windMph =  Math.round($scope.pracForecast.wind.speed * 2.2369)
                      $scope.pracForecast.deg = $scope.pracForecast.wind.deg

                      $scope.pracForecast.cloud = config.weatherIcons + '03d.png'
                      $scope.pracForecast.clouds = $scope.pracForecast.clouds.all
                      $scope.pracForecast_loaded = true;
                    }
                    break;
                  }
                }
              })
            }
            break;
          }
        }
  };

  $scope.$watch("season", function( value ) {
      if (value >= 1950) {
        $state.go('results', {'season': value});
      }
  });

  $location.path('/' + $stateParams.season + '/results');

}).filter('formatDateTime', [
  '$filter', function($filter) {
      return function(inputData) {
          var raceDate;
          if (typeof(inputData) == 'undefined') return false;
          // console.log(inputData)
          if (inputData.time) {
            raceDate = new Date(inputData.date + 'T' + inputData.time);
          }
          else {
            raceDate = new Date(inputData.date);
          }

          var retVal = raceDate.toUTCString();

          return retVal;
      };
  }
]).filter('getSimpleDate', [
  '$filter', function($filter) {
      return function(inputData) {
          var raceDate = new Date(inputData.date);

          var retVal = raceDate.getFullYear() + ('0' + (raceDate.getMonth()+1)).slice(-2)+ ('0' + raceDate.getDate()).slice(-2);
         
          return retVal;
      };
  }
]);
