const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

/*
  We don't need to make a router, just attack it to the app object
  we can just render it and stuff

  Everything gets handled
*/

// How to hook up camera and gps

const app = express();
// Have to include their websocket/pug file
// require((app))
const router = express.Router();

/*
  Library takes care of the sorting and stuff for us,
  even if it is on client side

  Map and reduce functions
*/

// Set static files folder
app.use(express.static('static'));

// Set view engine
app.set('view engine', 'ejs');

// Mount the router on the app
const urlEncodedParser = bodyParser.urlencoded({ extended: true });
app.use(urlEncodedParser)
app.use(bodyParser.json())
app.use(session({ secret: "secret key" }));
app.use('/', router);

app.listen(3000, function () {
  console.log('Running on port 3000')
});
let sortingMap = { "mostrecent": mostRecent, "leastrecent": leastRecent };

// TODO: Replace Mock Data with actual data
let mockData = [];
let mockDataDict = {};
let products = ["VP5300", "Augusta S", "VP8800", "VP6300"];
let loc = ["US-WC-CA-", "US-WC-NV-", "US-WC-OR-", "US-EC-NY-", "US-EC-FL-", "US-EC-MD-"];
let statuses = ["Connected", "RKI In Progress", "Offline"];
let start = new Date("01/01/2018"), end = new Date("01/01/2011");
for (let i = 0; i < 100; ++i) {
  let devid = loc[i % loc.length] + (300 - i);
  mockDataDict[devid] = i;
  mockData[i] = {
    "deviceID": devid,
    "product": products[i % products.length],
    "modelNo": "model" + i,
    "serialNo": "s" + i,
    "lastStatus": statuses[i % statuses.length],
    "lastHeartbeat": new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toString()
  }
}
// End TODO//mockdata[i][lastHeartbeat]
let months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
for (let i = 0; i < 100; ++i) {
  let date = mockData[i].lastHeartbeat;
  let month = date.substring(4, 7);
  if (month == "Jan") {
    months[0] += 1;
  }
  if (month == "Feb") {
    months[1] += 1;
  }
  if (month == "Mar") {
    months[2] += 1;
  }
  if (month == "Apr") {
    months[3] += 1;
  }
  if (month == "May") {
    months[4] += 1;
  }
  if (month == "Jun") {
    months[5] += 1;
  }
  if (month == "Jul") {
    months[6] += 1;
  }
  if (month == "Aug") {
    months[7] += 1;
  }
  if (month == "Sep") {
    months[8] += 1;
  }
  if (month == "Oct") {
    months[9] += 1;
  }
  if (month == "Nov") {
    months[10] += 1;
  }
  if (month == "Dec") {
    months[11] += 1;
  }

}
console.log(months)

// Middleware function checks if user is logged in before accessing a page.
function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  else {
    return res.redirect('/');
  }
}

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



// Two Factor Authentication
router.get('/twofact', function (req, res) {
  res.render('pages/twofact');
});
router.post('/twofact', function (req, res) {
  res.redirect('/');
});

// Login page
router.get('/login', function (req, res) {
  return res.render('pages/login');
});
router.post('/login', function (req, res) {
  req.session.user = { id: req.body.username, password: req.body.password };
  return res.redirect('/twofact');
});

// Device/Event Page
router.get('/devices', function (req, res) {

  // Check for URL Params
  let query = req.query.q,
    sortingMethod = req.query.sortby,
    lastStatus = req.query.status,
    to = req.query.to,
    from = req.query.from;

  if (!sortingMethod)
    sortingMethod = "mostrecent";

  let matchingData = getMatchingEntries(mockData, query, sortingMethod, lastStatus, to, from);

  if (!lastStatus)
    lastStatus = "Any";

  res.render('pages/devices', {
    "sortby": sortingMethod,
    "data": matchingData,
    "query": query,
    "lastStatus": lastStatus
  });
});

router.post('/devices', urlEncodedParser, (req, res) => {
  let query = req.body.query,
    sortingMethod = req.body.sortby,
    lastStatus = req.body.lastStatus,
    to = req.body.to,
    from = req.body.from;

  if (!sortingMethod)
    sortingMethod = "mostrecent";

  let matchingData = getMatchingEntries(mockData, query, sortingMethod, lastStatus, to, from);

  if (!lastStatus)
    lastStatus = "Any";

  res.render('pages/devices', {
    "sortby": sortingMethod,
    "data": matchingData,
    "query": query,
    "lastStatus": lastStatus
  });
});

// Home Page
router.get('/', function (req, res) {
  // User is logged in
  if (req.session && req.session.user) {
    res.render('pages/home', {
      "months": months,
    });
  }
  else {
    // User not logged in
    res.redirect('/login');
  }
});

// Profile Page
router.get('/profile', function (req, res) {
  res.render('pages/profile');
});

// Barcode Page
router.get('/barcode', function (req, res) {
  res.render('pages/barcode');
});

//GPS Page
router.get('/gps', function (req, res) {
  res.render('pages/gps');
});

// Logout Current User
router.get('/logout', function (req, res) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      res.redirect('/');
    });
  }
});

// TODO: Don't use a post request to get data
// Always use post to create data
// Get for requesting data
router.post('/getdevices', function (req, res) {
  let query = req.body.query,
    sortingMethod = req.body.sortby,
    lastStatus = req.body.lastStatus,
    to = req.body.to,
    from = req.body.from;
  if (!sortingMethod)
    sortingMethod = "mostrecent";

  let matchingData = getMatchingEntries(mockData, query, sortingMethod, lastStatus, to, from);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ sortby: sortingMethod, data: matchingData }));
});

router.post('/getdetails', function (req, res) {
  let deviceID = req.body.deviceID;
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(mockData[mockDataDict[deviceID]]));
});
