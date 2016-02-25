function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function prepYqlSkyNews(content) {
  // console.log(content)
  var retVal = []
   for (var i = 0; i < content.length; i++) {
    var item = content[i];
      retVal.push({
        unescapedUrl: item.h2.a.href,
        titleNoFormatting: item.h2.a.content,
        image: {
          url: item.div[0].div.a.img.src.replace('-206x155.jpg', '-589x442.jpg')
        },
        content: item.div[1].span[0].content + '...',
        publisher: item.div[1].span[1].content,
        publishedDate: item.div[1].span[2].content,
        timestamp: item.div[1].span[2]["data-updated"]*1000,
        type: 'news'
      })

  }
  return retVal;
}

function prepYqlBBCNews(content) {
  // console.log(content)
  var retVal = []
  for (var i = 0; i < content.length; i++) {
    var item = content[i].article;

    if (!item.div.div[0].p) continue;

    // item.div.div[1].ul.li.span.time["data-timestamp"]
    var timestamp = getTimestamp(item.div.div[1].ul.li)*1000

    if (!timestamp) continue;
    if(typeof item.aside.div.div == 'undefined') continue;
    if(typeof item.aside.div.div.div == 'undefined') continue;
    if(typeof item.aside.div.div.div["data-src"] == 'undefined') continue;
    
    retVal.push({
        unescapedUrl: 'http://www.bbc.co.uk' + item.a.href,
        titleNoFormatting: item.div.div[0].h3.a.span.content,
        image: {
          url: item.aside.div.div.div["data-src"].replace('{width}', '480-hidpi')
        },
        content: item.div.div[0].p.content,
        publisher: 'bbc.co.uk/news/',
        publishedDate: new Date(timestamp).toUTCString(),
        timestamp: timestamp,
        type: 'news'
      })
  }
  return retVal
}

function getTimestamp(elem) {
  // console.log(elem)
  if (!elem.span) return null;
  if (!elem.span.time) return null;
  return elem.span.time["data-timestamp"];
}

function prepXMLNews(content, publisher) {
   var retVal = []
   for (var i = 0; i < content.length; i++) {
    var item = content[i];
      retVal.push({
      unescapedUrl: item.link,
      titleNoFormatting: item.title,
      image: item.image,
      content: item.content,
      publisher: publisher,
      publishedDate: new Date(item.publishedDate).toUTCString(),
      timestamp: +new Date(item.publishedDate),
      type: 'news'
    })
  }

  return retVal
}

function prepGoogleNews(content) { // Google has now deactivated this
  // add a timestamp so that we can sort and merge the news feed
  var retVal = []
  // console.log(content)
  for (var i = 0; i < content.length; i++) {
    var item = content[i];
    // var itemDate = new Date(item.publishedDate)
    // var timestamp = +new Date(item.publishedDate)
    // console.log(itemDate, item.publishedDate, timestamp)
    retVal.push({
      unescapedUrl: item.unescapedUrl,
      titleNoFormatting: item.titleNoFormatting,
      image: item.image,
      content: item.content,
      publisher: item.publisher,
      publishedDate: new Date(item.publishedDate).toUTCString(),
      timestamp: +new Date(item.publishedDate),
      type: 'news'
    })
    if (retVal.length == 1) retVal[0].timestamp = 9999999999999; // to push the main artical back to top
    if (item.relatedStories) {
      for (var j = 0; j < item.relatedStories.length; j++) {
        var rel = item.relatedStories[j];
        retVal.push({
          unescapedUrl: rel.unescapedUrl,
          titleNoFormatting: rel.titleNoFormatting,
          publisher: rel.publisher,
          publishedDate: new Date(rel.publishedDate).toUTCString(),
          timestamp: +new Date(rel.publishedDate),
          type: 'related'
        })
      }
    }
  }

  // retVal.sort(timestampSort)

  // console.log(retVal)
  return retVal
}

function prepTweets(content, feed) {
  // console.log(content[0])
  var retVal = []
  for (var i = 0; i < content.length; i++) {
    var item = content[i];

    item.content = item.content.replace(/a href/g, "a target='_blank' href")
    item.content = item.content.replace(/<s>/g, "")

    retVal.push({
      feed: feed,
      titleNoFormatting: item.title,
      pic: 'https://twitter.com/' + feed + '/profile_image?size=normal',
      unescapedUrl: item.link,
      publisher: 'Twitter ' + feed,
      content: item.content,
      publishedDate: new Date(item.publishedDate).toUTCString(),
      timestamp: +new Date(item.publishedDate),
      type: 'twitter'
    })
  }
  // console.log(retVal)
  return retVal
}

function timestampSort(a,b) {
  if (a.timestamp < b.timestamp)
    return 1;
  if (a.timestamp > b.timestamp)
    return -1;
  return 0;
}

Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i].timestamp === a[j].timestamp) {
              a.splice(j--, 1);
            }
        }
    }

    return a;
};

function getImageWidth() {
  //console.log($(window).width())
  if ($(window).width() < config.picNarrowSize) return $(window).width()

  if ($(window).width() < config.picWideSize) return config.picNarrowSize
  return config.picWideSize;
}

function getYearRange() {
  //var startYear = new Date().getFullYear();
  //TODO: have holding page till 2015 data is available
  //var startYear = config.defaultYear;
  var startYear = new Date().getFullYear();
  var endYear = 1950;
  var dateRange = [];

  while(endYear <= startYear) {
      dateRange.push(startYear);
      startYear -= 1
  }
  return dateRange;
}

function getRoundRange(noRounds) {
  var roundRange = [];

  for (i = 1; i <= noRounds; i++) {
      roundRange.push(i);
  }

  return roundRange;
}

function parseXWiki(text) {
  return text;
  var retVal = text.split('|');
  //console.log(retVal[1])

  console.log(retVal)

  var tempRetVal = {
    trackLength: 56.332,
    turns: 33
  }

  return tempRetVal;
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
  // console.log('getting driver ' + driverId)
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].driverId == driverId) return arr[i].code
  }
  return driverId
}

function setStatData(raceTable) {
  // console.log(raceTable.Races[0].Results.length)
  for (var i = 0; i < raceTable.Races[0].Results.length; i++) {
    if(raceTable.Races[0].Results[i].grid == 0) raceTable.Races[0].Results[i].grid = ''
    if (typeof raceTable.Races[0].Results[i].FastestLap == 'undefined') {
      raceTable.Races[0].Results[i].FastestLap = {TimeOrder: 999999, AverageSpeedOrder: 999999}
    } else {
      raceTable.Races[0].Results[i].FastestLap.TimeOrder = convertToSecs(raceTable.Races[0].Results[i].FastestLap.Time.time)*1000;
      raceTable.Races[0].Results[i].FastestLap.AverageSpeedOrder = 1000 - raceTable.Races[0].Results[i].FastestLap.AverageSpeed.speed*1000;
    }
  }
}

function mergeDriverRaceQualDetails(raceDetails, qualDetails) {
  // TODO look to include qualifying data here
  return raceDetails
}

function getNationality(country) {
  var nationality = "";
  country = country.toLowerCase();
  if (country == "argentina") return "Argentine"
  if (country == "australia") return "Australian"
  if (country == "austria") return "Austrian"
  if (country == "azerbaijan") return "Azerbaijan"
  if (country == "bahrain") return "Bahrain"
  if (country == "belgium") return "Belgian"
  if (country == "brazil") return "Brazilian"
  if (country == "canada") return "Canadian"
  if (country == "china") return "Chinese"
  if (country == "france") return "French"
  if (country == "germany") return "German"
  if (country == "hungary") return "Hungarian"
  if (country == "india") return "India" 
  if (country == "italy") return "Italian"
  if (country == "japan") return "Japanese"
  if (country == "korea") return "SouthKorea" 
  if (country == "malaysia") return "Malaysian"  
  if (country == "mexico") return "Mexican"
  if (country == "monaco") return "Monaco"
  if (country == "netherlands") return "Dutch"
  if (country == "portugal") return "Portuguese"  
  if (country == "russia") return "Russian"
  if (country == "spain") return "Spanish"
  if (country == "singapore") return "Singapore"
  if (country == "south africa") return "South-African"    
  if (country == "sweden") return "Swedish"  
  if (country == "turkey") return "Turkey"  
  if (country == "uae") return "uae"
  if (country == "usa") return "American"
  if (country == "uk") return "British"
  console.log(country)


  return nationality;
}