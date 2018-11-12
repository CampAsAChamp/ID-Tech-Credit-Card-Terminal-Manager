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

// TODO: Replace Mock Data with actual data
var mockData = [];
var products = ["VP5300", "Augusta S", "VP8800", "VP6300"]
var status = ["Connected", "RKI In Progess", "Offline"]
var start = new Date("01/01/2018"), end = new Date("01/01/2011");
for (var i = 0; i < 100; ++i) {
  mockData[i] = {
    "deviceID" : "US-WC-CA-" + (300 - i),
    "product" : products[i % products.length],
    "modelNo" : "model" + i,
    "serialNo" : "s" + i,
    "lastStatus" : status[i % products.length],
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

// Utility function retrieves most recent N entries
function mostRecent(data, reverse=false, N=30) {
  const dateLabel = "lastHeartbeat";
  return data.sort(function(x, y) {
    const a = new Date(x[dateLabel]), b = new Date(y[dateLabel]);
    if (reverse)
      return b - a;
    return a - b;
  }).slice(N * -1);
}

function sortBy(data, sortingFunction, N=30) {
  return data.sort(sortingFunction).slice(N * -1);
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
  var fetched = mostRecent(mockData);
  res.render('pages/devices', {
    sortby: "mostrecent",
    data: fetched
  });
});

router.post('/devices', urlEncodedParser, (req, res) => {
  var sortingMethod = req.body.sortby;
  var fetched = [];
  switch(sortingMethod) {
    case "mostrecent":
      fetched = mostRecent(mockData);
      break;
    case "leastrecent":
      fetched = mostRecent(mockData, reverse=true);
      break;
  }
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
