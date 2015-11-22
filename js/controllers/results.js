angular.module('formulaOneApp.controllers').controller('ScheduleListController', function($scope, $rootScope, $state, $stateParams, $window, $location, Schedule, Weather, VisDataSet) {
  var currentYear = new Date().getFullYear();
  if (!$stateParams.season || $stateParams.season > currentYear) $stateParams.season = currentYear;
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
        retVal._id = $stateParams.season.toString()
        retVal.series = 'f1'

        $.ajax( { url: config.mongo.host + config.mongo.database + '/collections/schedule?apiKey=' + config.mongo.apiKey,
          data: JSON.stringify( retVal),
          type: "POST",
          contentType: "application/json" 
        });
        buildSchedulePage(retVal)
        
      });
    } else {
      buildSchedulePage(retVal)
    }
  });


// var dataGroups = new VisDataSet(
//   {id: 0, content: 'First', value: 1},
//   {id: 1, content: 'Third', value: 3},
//   {id: 2, content: 'Second', value: 2}
// );

// var dataItems = new VisDataSet(
//   {id: 0, group: 0, content: 'item 0', start: new Date(2014, 3, 17), end: new Date(2014, 3, 21)},
//   {id: 1, group: 0, content: 'item 1', start: new Date(2014, 3, 19), end: new Date(2014, 3, 20)},
//   {id: 2, group: 1, content: 'item 2', start: new Date(2014, 3, 16), end: new Date(2014, 3, 24)},
//   {id: 3, group: 1, content: 'item 3', start: new Date(2014, 3, 23), end: new Date(2014, 3, 24)},
//   {id: 4, group: 1, content: 'item 4', start: new Date(2014, 3, 22), end: new Date(2014, 3, 26)},
//   {id: 5, group: 2, content: 'item 5', start: new Date(2014, 3, 24), end: new Date(2014, 3, 27)}
// );

// $scope.graphData = {
//   items: dataItems,
//   groups: dataGroups
// };

// $scope.graphEvents = {
//   rangechange: $scope.onRangeChange,
//   rangechanged: $scope.onRangeChanged,
//   onload: $scope.onLoaded
// };

//   $scope.graphOptions = {
//     height: "200px"
//   };

  function buildSchedulePage(data) {

    $scope.schedule = data
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
        buildWeather(daysDifference);
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
            $scope.weatherForecast.weather[0].description = toTitleCase($scope.weatherForecast.weather[0].description);
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
                $scope.weatherForecast.weather[0].description = toTitleCase($scope.weatherForecast.weather[0].description);
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
                  // console.log('x > 8')
                  $scope.qualForecast = list[x-8]
                  raceDate.setDate(raceDate.getDate() - 1);
                  var theDate = raceDate.toDateString();
                  $scope.qualForecast.weather[0].description = toTitleCase($scope.weatherForecast.weather[0].description);
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
                  // console.log('x > 16')
                  $scope.pracForecast = list[x-16]
                  raceDate.setDate(raceDate.getDate() - 1);
                  var theDate = raceDate.toDateString();
                  $scope.pracForecast.weather[0].description = toTitleCase($scope.weatherForecast.weather[0].description);
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

  function buildWeather(daysDifference) {

  }

  $scope.$watch("season", function( value ) {
      if (value >= 1950) {
        $state.go('results', {'season': value});
      }
  });

  $location.path('/' + $stateParams.season + '/results');
  $scope.$on('$viewContentLoaded', function(event) {
    // console.log('viewContentLoaded', $location.url())

    $window.ga('send', 'pageview', { page: $location.url() });
  });

  $scope.getFlag = function(country) {
    return  "./images/flags/" + getNationality(country) + ".png"
  }
});