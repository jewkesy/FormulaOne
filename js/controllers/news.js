angular.module('formulaOneApp.controllers').controller('NewsController', function($scope, $location, $window, $sce, $http, $q, News) {

  var isoOptions = {
    isInitLayout: false,
    layoutMode: 'masonry'
  }

  $scope.$emit('iso-option', isoOptions);

  $scope.results = []

	function getNewsFeed() {
    var deferred = $q.defer();
    $http.jsonp(config.googleNews).success(function(data){
      console.log(data)
      if (data.responseStatus == 403) return deferred.resolve(data.responseDetails)
      var retVal = prepGoogleNews(data.responseData.results);
      return deferred.resolve(retVal);
    });
    return deferred.promise
  }

  function getNewsXml() {
    var deferred = $q.defer();
    $http.jsonp(config.googleApi + 'http://feeds.bbci.co.uk/sport/0/formula1/rss.xml?edition=uk&callback=JSON_CALLBACK').success(function(data){
      // console.log(data)
      if (data.responseStatus == 403) return deferred.resolve(data.responseDetails)
      var retVal = prepXMLNews(data.responseData.feed.entries, 'bbc.co.uk/news/');
      return deferred.resolve(retVal);
    });
    return deferred.promise
  }

function getNewsYql(site) {
  var deferred = $q.defer();

  var url = "https://query.yahooapis.com/v1/public/yql?format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK&"

  if(site == 'sky') {

    url += "q=SELECT%20*%20FROM%20data.html.cssselect%20WHERE%20url%3D'http%3A%2F%2Fnews.sky.com%2Fsearch%3Fterm%3Df1%26filter%3D'%20AND%20css%3D'li.results__item'"
    $http.jsonp(url).success(function(data){
      // console.log(data)
      $scope.content_loaded = true;
      if (data.responseStatus == 403) return deferred.resolve(data.responseDetails)
      var retVal = prepYqlSkyNews(data.query.results.results.li);
      // console.log(retVal)
     for (var i = 0; i < retVal.length; i++) {
        $scope.results.push(retVal[i])
      }
      // console.log($scope.results )
        return deferred.resolve(retVal);
      });
    } else if (site == 'bbc') {
      url += "q=SELECT%20*%20FROM%20data.html.cssselect%20WHERE%20url%3D'http%3A%2F%2Fwww.bbc.co.uk%2Fsport%2Fformula1'%20AND%20css%3D'div.lords__item'"
      $http.jsonp(url).success(function(data){
        // console.log(data)
        if (data.responseStatus == 403) return deferred.resolve(data.responseDetails)
        var retVal = prepYqlBBCNews(data.query.results.results.div);
        return deferred.resolve(retVal);
      });
    }
    return deferred.promise
  }

  function getTwitterFeed(feed) {
    var deferred = $q.defer();
    var url = config.googleApi + config.twitterFeed + feed + '&callback=JSON_CALLBACK';
    // url = "http://rss2json.com/api.json?rss_url=https%3A%2F%2Fnews.ycombinator.com%2Frss"
    // console.log(url)
    $http.jsonp(url).success(function(data){
      var retVal = prepTweets(data.responseData.feed.entries, feed);
      $scope.content_loaded = true;
      for (var i = 0; i < retVal.length; i++) {
        $scope.results.push(retVal[i])
      }
      
      // console.log($scope.results )
      return deferred.resolve(retVal);
    });
    return deferred.promise
  }

  $q.all([
      getNewsYql('sky'),
      getNewsYql('bbc'), // needs work
      getNewsXml(),
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
      getTwitterFeed('@SauberF1Team'),
      getTwitterFeed('@bbcf1feed'),
      getTwitterFeed('@RenaultSportF1'),
      getTwitterFeed('@HaasF1Team'),
      getTwitterFeed('@f1fanatic_co_uk'),
      getTwitterFeed('@f1fanaticlive')
    ]).then(function(data) {
     $scope.results.sort(timestampSort).unique()
  });

  $location.path('/news');
  $scope.$on('$viewContentLoaded', function(event) {
    $window.ga('send', 'pageview', { page: $location.url() });
  });

});