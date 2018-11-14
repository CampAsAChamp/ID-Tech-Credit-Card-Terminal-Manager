var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var app = express();
var router = express.Router();

// Set static files folder
app.use(express.static('static'));

// Set view engine
app.set('view engine', 'ejs');

// Mount the router on the app
var urlEncodedParser = bodyParser.urlencoded({extended: true});
app.use(urlEncodedParser)
app.use(bodyParser.json())
app.use(session({secret: "secret key"}));
app.use('/', router);

app.listen(3000, function () {
    console.log('Running on port 3000')
});
var sortingMap = {"mostrecent": mostRecent, "leastrecent": leastRecent};

// TODO: Replace Mock Data with actual data
var mockData = [];
var products = ["VP5300", "Augusta S", "VP8800", "VP6300"];
var loc = ["US-WC-CA-", "US-WC-NV-", "US-WC-OR-", "US-EC-NY-", "US-EC-FL-", "US-EC-MD-"];
var statuses = ["Connected", "RKI In Progress", "Offline"];
var start = new Date("01/01/2018"), end = new Date("01/01/2011");
for (var i = 0; i < 100; ++i) {
  mockData[i] = {
    "deviceID" : loc[i % loc.length] + (300 - i),
    "product" : products[i % products.length],
    "modelNo" : "model" + i,
    "serialNo" : "s" + i,
    "lastStatus" : statuses[i % statuses.length],
    "lastHeartbeat" : new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toString()
  }
}
// End TODO

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

function sortBy(data, sortingFunction, N=30) {
  return data.sort(sortingFunction).slice(0, N);
}

// Utility function filters data by a list of functions
// that return true/false based 
function filter(data, conditions) {
  return data.filter(function(entry) {
    var res = true;
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
  return function(entry) {
    return entry[fieldName].toLowerCase() == mustEqual.toLowerCase();
  };
}

// Utility function creates filter that ensures a
// date is within range [start, end]. Either can be null
// to allow for no min or max date.
function createRangeFilter(fieldName, start, end) {
  return function(entry) {
    var d = new Date(entry[fieldName]);
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

// Home Page
router.get('/', function (req, res) {
  // User is logged in
  if (req.session && req.session.user) {
      res.render('pages/home');
  }
  else {
    // User not logged in
    res.redirect('/login');
  }
});

// Two Factor Authentication
router.get('/twofact', function (req, res) {
  res.render('pages/twofact');
});
router.post('/twofact', function(req, res) {
  res.redirect('/');
});

// Login page
router.get('/login', function(req, res) {
  return res.render('pages/login');
});
router.post('/login', function(req, res) {
  req.session.user = {id: req.body.username, password: req.body.password};
  return res.redirect('/twofact');
});

// Device/Event Page
router.get('/devices', function(req, res) {
  var sortingMethod = "mostrecent";
  var fetched = sortBy(mockData, sortingMap[sortingMethod]);
  res.render('pages/devices', {
    sortby: "mostrecent",
    data: fetched
  });
});

router.post('/devices', urlEncodedParser, (req, res) => {
  var sortingMethod = req.body.sortby;
  var fetched = sortBy(mockData, sortingMap[sortingMethod]);
  res.render('pages/devices', {
    sortby: sortingMethod,
    data: fetched
  });
});

// Profile Page
router.get('/profile', function(req, res) {
  res.render('pages/profile');
});

// Logout Current User
router.get('/logout', function(req, res) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      res.redirect('/');
    });
  }
});

router.post('/getdevices', function(req, res) {
  var query = req.body.query,
      sortingMethod = req.body.sortby,
      lastStatus = req.body.lastStatus,
      to = req.body.to,
      from = req.body.from;

  var filters = [];
  if (query)
    filters.push(function(e){ return e["deviceID"].toLowerCase().match(query.toLowerCase()); });
  if (lastStatus && lastStatus != "Any")
    filters.push(createEQfilter("lastStatus", lastStatus));
  if (to || from)
    filters.push(createRangeFilter("lastHeartbeat", from, to));

  var matchingData = mockData;
  if (filter.length > 0)
    matchingData = filter(mockData, filters);
  if (!sortingMethod)
    sortingMethod = "mostrecent";


  matchingData = sortBy(matchingData, sortingMap[sortingMethod]);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ sortby: sortingMethod, data: matchingData }));
});
