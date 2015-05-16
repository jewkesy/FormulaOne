
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