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

function buildConstructorCache(url) {
  request({ url: url, json: true }, function (error, response, body) {
    fs.writeFile('db/cache/constructors.json', JSON.stringify(body, null, 4), function (err) {
      if (err) return console.log(err);
      console.log('done? > db/cache/constructors.json');
    });
  });
}

// driver profile pics

// get list of drivers
// http://ergast.com/api/f1/drivers.json?limit=1000
// processDriverPics("http://ergast.com/api/f1/drivers.json?limit=1000")

// circuits

// constructors
buildConstructorCache("http://ergast.com/api/f1/constructors.json?limit=1000")
