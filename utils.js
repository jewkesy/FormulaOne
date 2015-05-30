var fs = require('fs');
var request = require('request');

var wikiApi = "http://en.wikipedia.org/w/api.php?format=json&action=query&redirects&prop=pageimages&titles=",

download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream('./images/drivers/' + filename)).on('close', callback);
  });
};

downloadWikiPic = function(url, saveFileName, callback){
  request({ url: url, json: true }, function(err, res, body){

    for (var page in body.query.pages) {
      for (var thumbnail in body.query.pages[page].thumbnail) {
        for (var source in body.query.pages[page].thumbnail[thumbnail]) {
          console.log(body.query.pages[page].thumbnail[thumbnail[source]])
        }
      }
    }

    //request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    // download(url, filename, function(){
    //   console.log('done');
    // });
  });
};



function processDriverPics(url) { request({ url: url, json: true }, function (error, response, body) {
  if (error) { return console.log(error)};
  if (response.statusCode === 200) {
    var drivers = body.MRData.DriverTable.Drivers;
    for (var driver in drivers) {
      //console.log(drivers[driver].givenName)
      var wikiUrl = drivers[driver].url.split("/");
      wikiUrl = wikiUrl[wikiUrl.length - 1];

      downloadWikiPic(wikiApi + wikiUrl + "&pithumbsize=" + 200, drivers[driver].driverId, function() {console.log('done ' + wikiUrl)})
    }
  }
})
}

function buildConstructorCache(url, startFrom) {
  request({ url: url + 'constructors.json?limit=1000', json: true }, function (error, response, body) {
    fs.writeFile('db/cache/constructors.json', JSON.stringify(body, null, 4), function (err) {
      if (err) return console.log(err);
      console.log('done > db/cache/constructors.json');
    });

    var constructors = body.MRData.ConstructorTable.Constructors;
    //console.log(constructors)
    var letsGo = false;
    for (var idx in constructors) {
      if (startFrom == constructors[idx].constructorId) {
        letsGo = true;
      }
      if (!letsGo) continue;

      consUrl = url + 'constructors/' + constructors[idx].constructorId + '/constructorStandings.json'

      console.log('Requesting ' + consUrl)

      request({ url: consUrl, json: true }, function (error, response, body) {
        if(error) return console.log(error)

        var localPath = body.MRData.url.replace(url, 'db/cache/').replace('/constructorstandings.json', '.json');

        fs.writeFile(localPath, JSON.stringify(body, null, 4), function (err) {
          if (err) return console.log(err);
          console.log('done > ' + localPath)
        });
      });
    }
  });
}

function buildDriverCache(url, startFrom) {

  request({ url: url + 'drivers.json?limit=100&offset=' + startFrom, json: true }, function (error, response, body) {
    if(error) return console.log(error)
    fs.writeFile('db/cache/drivers.json', JSON.stringify(body, null, 4), function (err) {
      if (err) return console.log(err);
      console.log('done > db/cache/drivers.json');
    });

    var drivers = body.MRData.DriverTable.Drivers;

    for (var idx in drivers) {
      driverUrl = url + 'drivers/' + drivers[idx].driverId + '.json'
      console.log(driverUrl)

      var driverFile = 'db/cache/drivers/' + drivers[idx].driverId + '.json'

      request({ url: driverUrl, json: true }, function (error, response, body) {
        if (error) return console.log(error);

        var localPath = body.MRData.url.replace(url, 'db/cache/');

        fs.writeFile(localPath, JSON.stringify(body, null, 4), function (err) {
          if (err) return console.log(err);
          console.log('done > ' + localPath)
        });
      });

    }
  });

}

// driver profile pics

// get list of drivers
// http://ergast.com/api/f1/drivers.json?limit=1000
// processDriverPics("http://ergast.com/api/f1/drivers.json?limit=1000")

// circuits

// constructors
buildDriverCache("http://ergast.com/api/f1/", 800)
