angular.module('formulaOneApp.controllers').controller('ConstructorViewController', function($scope, $rootScope, $http, $timeout, $q, $stateParams, $window, $location, Constructor) {
  $scope.$on('$viewContentLoaded', function(event) {
    $window.ga('send', 'pageview', { page: $location.url() });
  });
  $scope.data = Constructor.mongo.query({ id: $stateParams.id, series: 'f1' }, function(response){
    // console.log($scope.data)
    if (typeof($scope.data[0]) == 'undefined') {
      $scope.data = Constructor.constructor.get({ id: $stateParams.id, series: 'f1' }, function(response){
        var retVal = $scope.data
        // console.log(retVal)
        retVal._id = $stateParams.id
        retVal.series = 'f1'
        // console.log(retVal)
        retVal.MRData.StandingsTable.StandingsLists.sort(function(a, b){
         return b.season - a.season
        })
        $.ajax( { url: config.mongo.host + config.mongo.database + '/collections/constructors?apiKey=' + config.mongo.apiKey,
          data: JSON.stringify( retVal),
          type: "POST",
          contentType: "application/json" 
        });
        buildConstructorChart(retVal)
        buildConstructor(retVal)

      });
    } else {
      // console.log('got constructor from mongo')
      buildConstructorChart($scope.data[0])
      buildConstructor($scope.data[0])
    }
  });

  function buildConstructorChart(data) {
    // console.log(data)
    if (data.MRData.StandingsTable.StandingsLists.length == 0) return false;
    
    var chartLabels = []
    var chartData = [[],[]]
    var chartSeries = ['Points', 'Wins']
    // chartSeries.push(data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings[0].Constructor.name)

    // for (var i = 0; i < data.MRData.StandingsTable.StandingsLists.length; i++){
    for (var i = data.MRData.StandingsTable.StandingsLists.length -1; i>=0; i--){
      var score = data.MRData.StandingsTable.StandingsLists[i];
      // console.log(i, score)
      chartLabels.push(score.season)
      chartData[0].push(parseInt(score.ConstructorStandings[0].points,0))
      chartData[1].push(parseInt(score.ConstructorStandings[0].wins,0))
    }

    // console.log(chartLabels, chartData, chartSeries)

    $scope.chartLabels = chartLabels;
    $scope.chartData = chartData;
    // console.log(chartData)
    $scope.chartSeries = chartSeries;

    var width = $window.innerWidth
    if (width <= 400) 
      $scope.chartOptions = {legend: true, scaleUse2Y: true, animation: false}
    else if (width <= 640)
      $scope.chartOptions = {legend: true, scaleUse2Y: true, animation: true, animationStep: 10}
    else 
      $scope.chartOptions = {legend: true, scaleUse2Y: true, animation: true}
    
    $scope.onClick = function (points, evt) {
      // console.log(points, evt);
    };
    $scope.$on('create', function () {
       $scope.chartLoaded = true;
    });
  }

  function buildConstructor(constructor) {
    // console.log(constructor)
    var retVal = constructor.MRData.StandingsTable;
    if (retVal.StandingsLists.length == 0) { $scope.content_loaded=true; $scope.no_data=true;$scope.chartLoaded = true; return false;}
    $rootScope.title = "Formula One Stats .:. Constructors .:. " + retVal.StandingsLists[0].ConstructorStandings[0].Constructor.name;
    
    var wikiUrl = retVal.StandingsLists[0].ConstructorStandings[0].Constructor.url.split("/");
    wikiUrl = wikiUrl[wikiUrl.length - 1];

    retVal.wikiName = wikiUrl;

    $scope.getConstructorPic(wikiUrl);

    $scope.team = retVal
    $scope.content_loaded = true;
  }

  function getTwitterFeed(feed) {
    var deferred = $q.defer();

    var handle = config.twitter[0][feed]
    if (!handle) deferred.resolve();

    $http.jsonp(config.googleApi + config.twitterFeed + handle + '&callback=JSON_CALLBACK').success(function(data){
      var retVal = prepTweets(data.responseData.feed.entries, handle);
      return deferred.resolve(retVal);
    });
    return deferred.promise
  }

  $q.all([getTwitterFeed($stateParams.id)]).then(function(data) {
    // console.log(data[0])
    $scope.tweets = data[0];
  });

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
});