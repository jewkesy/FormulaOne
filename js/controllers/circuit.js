angular.module('formulaOneApp.controllers').controller('CircuitViewController', function($scope, $rootScope, $http, $sce, $timeout, $stateParams, $location, $window, Circuit) {
  $scope.$on('$viewContentLoaded', function(event) {
    $window.ga('send', 'pageview', { page: $location.url() });
  });
  $scope.data = Circuit.circuit.get({ id: $stateParams.id, series: 'f1' }, function(){

    if ($scope.data.MRData.CircuitTable.Circuits == 0) { $scope.content_loaded=true; $scope.no_data=true;return false;}
    var retVal = $scope.data.MRData.CircuitTable.Circuits[0];

    $rootScope.title = "Formula One Stats .:. Circuits .:. " + retVal.circuitName;
    $scope.gMapUrl = "https://www.google.co.uk/maps/@52.7055818,-1.7753949,15z";

    var wikiUrl = retVal.url.split("/");
    wikiUrl = wikiUrl[wikiUrl.length - 1];

    retVal.wikiName = wikiUrl;
    $scope.content_loaded = true;
    $scope.getCircuitPic(wikiUrl);
    $scope.getCircuitDetails(wikiUrl);
    $scope.circuit = retVal
  });

  $scope.getCircuitPic = function(circuitName) {
    var url = config.wikiApi + circuitName + "&pithumbsize=" + getImageWidth();
    return $http.jsonp(url)
    .success(function(data){
        $.each(data.query.pages, function(i,item){
          $scope.circuit.imageUrl = item.thumbnail.source;
          return;
        });
    });
  };

  $scope.getCircuitDetails = function(circuitName) {
    var url = "http://en.wikipedia.org/w/api.php?action=parse&prop=text&section=0&format=json&callback=JSON_CALLBACK&page=" + circuitName;
    return $http.jsonp(url)
    .success(function(data){
      $.each(data.parse.text, function(i,item){
        item = item.replace("width:22em", "width:100%")

        $scope.circuit.details = $sce.trustAsHtml(parseXWiki(item));
        return;
      });
    });
  };

});