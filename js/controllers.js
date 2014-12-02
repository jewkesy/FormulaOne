angular.module('formulaOneApp.controllers', [])
.controller('DriverListController', function($scope, $state, $stateParams, $window, Driver) {
  if (!$stateParams.season) $stateParams.season = new Date().getFullYear();
  //console.log($stateParams.season)
  $scope.season = $stateParams.season;
  $scope.year = "Select season";
  $scope.data = Driver.standings.get({season: $stateParams.season, series: 'f1' }, function(){
    var retVal = $scope.data.MRData.StandingsTable.StandingsLists[0]
    $scope.drivers = retVal

    var startYear = new Date().getFullYear();
    var endYear = 1950;
    var dateRange = [];

    while(endYear <= startYear) {
        dateRange.push(startYear);
        startYear -= 1
    }
    $scope.years = dateRange;
  }); //fetch all drivers. Issues a GET to /api/drivers

  $scope.$watch("season", function( value ) {
      if (value >= 1950) {
        $state.go('drivers', {'season': value});
      }
  });

}).controller('DriverViewController', function($scope, $http, $timeout, $stateParams, Driver) {
  $scope.data = Driver.driver.get({ id: $stateParams.id, series: 'f1' }, function(){
    var retVal = $scope.data.MRData.DriverTable.Drivers[0];
    var ageDifMs = Date.now() - new Date(retVal.dateOfBirth);
    var ageDate = new Date(ageDifMs); // miliseconds from epoch

    retVal.Age = Math.abs(ageDate.getUTCFullYear() - 1970);
    retVal.flagUrl = "http://jewkesy.github.io/colloquial/images/flags/" + retVal.nationality + ".png"

    var wikiUrl = retVal.url.split("/");
    wikiUrl = wikiUrl[wikiUrl.length - 1];

    retVal.wikiName = wikiUrl;

    $scope.getProfilePic(wikiUrl).then(function (imgUrl) {
      console.log(imgUrl)
      // $.each(data.query.pages, function(i,item){
      //   console.log('')
      //   //return "http://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Lewis_Hamilton_October_2014.jpg/72px-Lewis_Hamilton_October_2014.jpg"
      //   //retVal.imageUrl = item.thumbnail.source;
      // });

     retVal.imageUrl = imgUrl;
     //retVal.imageUrl = imgUrl.query.pages[0].thumbnail.source;

    });

    $scope.driver = retVal
  }); //Get a single driver. Issues a GET to /api/driver/:id

  $scope.getProfilePic = function(driverName) {
  //  console.log(driverName)
    var url = "http://en.wikipedia.org/w/api.php?callback=JSON_CALLBACK&action=query&titles=" + driverName + "&prop=pageimages&format=json&pithumbsize=200";

    return $http.jsonp(url)
    .success(function(data){
        $.each(data.query.pages, function(i,item){
          //return "http://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Lewis_Hamilton_October_2014.jpg/72px-Lewis_Hamilton_October_2014.jpg"
          console.log(item.thumbnail.source)
          return item.thumbnail.source;
        });
    });


      // return $http.jsonp("http://en.wikipedia.org/w/api.php?callback=JSON_CALLBACK", {
      //     action: "query",
      //     titles: driverName,
      //     prop: "pageimages",
      //     format: "json",
      //     pithumbsize: "200"
      // }, function (data) {
      //     // ... get the image URL from the data and return it
      //     console.log(data)
      //     $.each(data.query.pages, function(i,item){
      //         return item.thumbnail.source;
      //     });
      // });
  };

  // $scope.getProfilePic = function(title) {
  //   if (title == undefined) return;
  //   console.log(title)
  //   $.getJSON("http://en.wikipedia.org/w/api.php?callback=JSON_CALLBACK&action=query&titles=Lewis_Hamilton&prop=pageimages&format=json&pithumbsize=100", function(data) {
  //     console.log(data)
  //     return "http://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Lewis_Hamilton_October_2014.jpg/72px-Lewis_Hamilton_October_2014.jpg"
  //   });


//    return "http://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Lewis_Hamilton_October_2014.jpg/143px-Lewis_Hamilton_October_2014.jpg"
    // $.getJSON("http://en.wikipedia.org/w/api.php?callback=?",
    // {
    //     action: "query",
    //     titles: title,
    //     prop: "pageimages",
    //     format: "json",
    //     pithumbsize: "200"
    // }, function(data) {
    //     $.each(data.query.pages, function(i,item){
    //         return item.thumbnail.source;
    //     });
    // });
//  }
});
