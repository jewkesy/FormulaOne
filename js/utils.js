function prepStuff(content) {
  //console.log(content)

  //remove html
  //content.replace("<b>", "");
  //retVal = retVal.replace("</b>", "");

  return content
}


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
  console.log('getting driver ' + driverId)
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].driverId == driverId) return arr[i].code
  }
  return driverId
}

function mergeDriverRaceQualDetails(raceDetails, qualDetails) {
  // TODO look to include qualifying data here
  return raceDetails
}