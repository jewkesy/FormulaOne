angular.module('formulaOneApp.controllers').controller('NewsController', function($scope, $location, $window, $sce, $http, $q, News) {

	function getNewsFeed() {
    var deferred = $q.defer();
    $http.jsonp(config.googleNews).success(function(data){
      var retVal = prepNews(data.responseData.results);
      return deferred.resolve(retVal);
    });
    return deferred.promise
  }

  function getTwitterFeed(feed) {
    var deferred = $q.defer();

    $http.jsonp(config.googleApi + config.twitterFeed + feed + '&callback=JSON_CALLBACK').success(function(data){
      var retVal = prepTweets(data.responseData.feed.entries, feed);
      return deferred.resolve(retVal);
    });
    return deferred.promise
  }

  $q.all([getNewsFeed(), 
      getTwitterFeed('@f1'), 
      getTwitterFeed('@McLarenF1'), 
      getTwitterFeed('@mercedesamgf1'), 
      getTwitterFeed('@therealdcf1'),
      getTwitterFeed('@redbullracing'),
      getTwitterFeed('@ScuderiaFerrari'),
      getTwitterFeed('@WilliamsRacing'),
      getTwitterFeed('@ForceIndiaF1'),
      getTwitterFeed('@Lotus_F1Team'),
      getTwitterFeed('@ToroRossoSpy'),
      getTwitterFeed('@manorf1team'),
      getTwitterFeed('@SauberF1Team')
    ]).then(function(data) {

    $scope.content_loaded = true;
    var combined = [];
    for (var i = 0; i < data.length; i++) {
      combined = combined.concat(data[i])
    }
    var retVal = combined.sort(timestampSort).unique()
    $scope.results = retVal;
  });

  $location.path('/news');
  $scope.$on('$viewContentLoaded', function(event) {
    // console.log('viewContentLoaded', $location.url())
    $window.ga('send', 'pageview', { page: $location.url() });
  });

});