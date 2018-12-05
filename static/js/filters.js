// Sorting Functions
function mostRecent(x, y) {
  const dateLabel = "lastHeartbeat",
    a = new Date(x[dateLabel]),
    b = new Date(y[dateLabel]);
  return b - a;
}

function leastRecent(x, y) {
  const dateLabel = "lastHeartbeat",
    a = new Date(x[dateLabel]),
    b = new Date(y[dateLabel]);
  return a - b;
}

// Function returns data sorted by a provided
// sorting function
function sortBy(data, sortingFunction, N = 30) {
  return data.sort(sortingFunction).slice(0, N);
}

// Utility function filters data by a list of functions
// that return true/false based
function filter(data, conditions) {
  return data.filter(function (entry) {
    let res = true;
    for (let condition of conditions) {
      if (!condition(entry)) {
        res = false;
        break;
      }
    }
    return res;
  });
}

// Utility function creates filter that ensures a
// field is equal to a specified value
function createEQfilter(fieldName, mustEqual) {
  return function (entry) {
    return entry[fieldName].toLowerCase() == mustEqual.toLowerCase();
  };
}

// Utility function creates filter that ensures a
// date is within range [start, end]. Either can be null
// to allow for no min or max date.
function createRangeFilter(fieldName, start, end) {
  return function (entry) {
    let d = new Date(entry[fieldName]);
    if (!start && !end) {
      return true;
    }
    else if (!start) {
      return (d < (new Date(end)));
    }
    else if (!end) {
      return (d > (new Date(start)));
    }
    else {
      return (d < (new Date(end))) && (d > (new Date(start)));
    }
  }
}

function getMatchingEntries(data, query, sortingMethod, lastStatus, to, from) {
  let filters = [];
  if (query)
    filters.push(function (e) { return e["deviceID"].toLowerCase().match(query.toLowerCase()); });
  if (lastStatus && lastStatus != "Any")
    filters.push(createEQfilter("lastStatus", lastStatus));
  if (to || from)
    filters.push(createRangeFilter("lastHeartbeat", from, to));

  let matchingData = data;
  if (filter.length > 0)
    matchingData = filter(data, filters);

  return sortBy(matchingData, sortingMap[sortingMethod]);
}