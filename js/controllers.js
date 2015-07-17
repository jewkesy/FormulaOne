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

  $scope.data = Driver.cache.get({ id: $stateParams.id, series: 'f1' }, buildDriver, function(response){
    if(response.status === 404) {
      console.log('could not find cache for ' + $stateParams.id)
      $scope.data = Driver.driver.get({ id: $stateParams.id, series: 'f1' }, buildDriver, function(response){
        if(response.status === 404) {
          console.log('could not find driver for ' + $stateParams.id)
        } 
      });
    }
  });

  function buildDriver() {
    $scope.content_loaded = true;
    var retVal = $scope.data.MRData.DriverTable.Drivers[0];

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

  $scope.data = Circuit.circuits.get({season: $stateParams.season, series: 'f1' }, function(){
    $scope.content_loaded = true;
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

  // $scope.data = Constructor.cache.get({ id: $stateParams.id, series: 'f1' }, function(){
  //   console.log($scope.data)
  // })

  $scope.data = Constructor.cache.get({ id: $stateParams.id, series: 'f1' }, buildConstructor, function(response){
    if(response.status === 404) {
      console.log('could not find cache for ' + $stateParams.id)
      $scope.data = Constructor.constructor.get({ id: $stateParams.id, series: 'f1' }, buildConstructor, function(response){
        if(response.status === 404) {
          console.log('could not find constructor for ' + $stateParams.id)
        }
      });
    }
  });

  function buildConstructor() {
    $scope.content_loaded = true;
    var retVal = $scope.data.MRData.StandingsTable;
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

  var raceResults = Result.race.get({season: $stateParams.season, series: 'f1', id: $stateParams.round }, function() {});
  var qualResults = Result.qualifying.get({season: $stateParams.season, series: 'f1', id: $stateParams.round }, function () {});
  // var lapResults =  Result.laps.get({season: $stateParams.season, series: 'f1', id: $stateParams.round }, function () {

  //   var lapDetails =  lapResults.MRData.RaceTable.Races[0].Laps
  //   console.log(lapDetails)

  //   $scope.chartLabels = [];
  //   $scope.chartData = [];
  //   $scope.series = [];

  //   for (var i = 0; i < lapDetails[0].Timings.length; i++) {
  //     $scope.series.push(lapDetails[0].Timings[i].driverId)
  //   }

  //   for (var i = 0; i < lapDetails.length; i++) {
  //     $scope.chartLabels.push(lapDetails[i].number)
  //     var timings = []
  //     for (var x = 0; x < lapDetails[i].Timings.length; x++) {
  //        timings.push(lapDetails[i].Timings[x].time)
  //     }
  //     console.log(timings)
  //     $scope.chartData.push(timings)
  //   }    
  //   // console.log( $scope.chartData)

  //   // $scope.chartLabels = ["January", "February", "March", "April", "May", "June", "July"];
  //   // $scope.series = ['Series A', 'Series B'];
  //   // $scope.chartData = [
  //   //   [65, 59, 80, 81, 56, 55, 40],
  //   //   [28, 48, 40, 19, 86, 27, 90]
  //   // ];
  //   $scope.onClick = function (points, evt) {
  //     // console.log(points, evt);
  //   };
  // });

  $q.all([raceResults.$promise, qualResults.$promise]).then(function(data){
  
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
  // console.log($scope.currentDate)
  $scope.data = Schedule.schedule.get({season: $stateParams.season, series: 'f1' }, function(){
    $scope.content_loaded = true;
    var retVal = $scope.data.MRData.RaceTable

    $scope.schedule = retVal
    // var currDate = new Date().getTime();
    // var currDate = new Date("July 19, 2015 10:00:00Z").getTime();


    var today = new Date();
    today.setDate(today.getDate() + 1);  // add 1 day for human-readable
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    } 

    if(mm<10) {
        mm='0'+mm
    } 

    today = yyyy+'-'+mm+'-'+dd;
    var currDate = new Date(today).getTime();

    for (var i = 0; i < retVal.Races.length; i++) {
      var strDateTime = retVal.Races[i].date;
      var raceDate = new Date(strDateTime).getTime();
      
      if (raceDate >= currDate) {
        // console.log(raceDate, currDate)
        retVal.Races[i].upcoming = true;
        $scope.nextRace = retVal.Races[i];
        // console.log(retVal.Races[i])
        // console.log(raceDate)
        // console.log(raceDate - currDate, raceDate, currDate)

        var circuit = retVal.Races[i];
        var daysDifference = Math.floor((raceDate - currDate)/1000/60/60/24); 

        if (daysDifference == 0) {
          $scope.timeToRace = daysDifference + 1 + ' day away'
        } else {
          $scope.timeToRace = daysDifference + 1 + ' days away'
        }
        
        // console.log(daysDifference)

        raceDate = raceDate/1000

        if (daysDifference > 5) { //+2 is used to account for day difference
          $scope.weather = Weather.extended.get({latitude: circuit.Circuit.Location.lat, longitude: circuit.Circuit.Location.long, days: daysDifference + 2, units: "metric"}, function(){
            $scope.weatherForecast = $scope.weather.list[(daysDifference + 2) - 1]

            $scope.weatherForecast.temp.day = Math.round($scope.weatherForecast.temp.day)
            $scope.weatherForecast.temp.min = Math.round($scope.weatherForecast.temp.min)
            $scope.weatherForecast.temp.max = Math.round($scope.weatherForecast.temp.max)

            $scope.weatherForecast.icon = config.weatherIcons + $scope.weatherForecast.weather[0].icon + '.png'
            $scope.weatherForecast.WindIcon = config.weatherIcons + 'arrow.png'
            $scope.weatherForecast.windMph =  Math.round($scope.weatherForecast.speed * 2.2369)

            $scope.weatherForecast.cloud = config.weatherIcons + '03d.png'

            // console.log($scope.weatherForecast)
            $scope.weather_loaded = true;
          })
        } else {
          $scope.weather = Weather.forecast.get({latitude: circuit.Circuit.Location.lat, longitude: circuit.Circuit.Location.long, days: 0, units: "metric"}, function(){
            $scope.weatherForecast = "5 Day Forecast"
            // console.log($scope.weather)
            var list = $scope.weather.list
            var theWeather = '';
            for (var x = 0; x < list.length; x++) {
              // console.log(list[x].dt, raceDate)

              if (list[x].dt > raceDate) {
                // console.log('this is the race forecast: -')
                // console.log(list[x])

                $scope.weather_loaded = true;
                break;
              }
            }
          })
        }
        
        break;
      }
    }
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
