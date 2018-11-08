const express = require('express');
const app = express();
app.set('view engine', 'ejs');
const router = express.Router();
app.use(express.static('static'))

// TODO: Delete later
var mockData = [];
var products = ["VP5300", "Augusta S", "VP8800", "VP6300"]
var status = ["Connected", "RKI In Progess", "Offline"]
for (var i = 0; i < 100; ++i) {
  mockData[i] = {
    "deviceID" : "US-WC-CA-" + (300 - i),
    "product" : products[i % products.length],
    "modelNo" : "model" + i,
    "serialNo" : "s" + i,
    "lastStatus" : status[i % products.length],
    "lastHeartbeat" : new Date(Date.now() - Math.random()).toString()
  }
}
// End TODO: Delete Later

// Middleware function checks if user is logged in before accessing a page.
function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}

// Utility function retrieves most recent N entries
function mostRecent(data, N=5) {
  const dateLabel = "lastHeartbeat";
  return data.sort(function(entryX, entryY) {
    const x = entryX[dateLabel], y = entryY[dateLabel];
    if (x < y) {
      return -1;
    }
    if (x > y) {
      return 1;
    }
    return 0;
  }).slice(N * -1);
}

// Login/Home Page
router.get('/', function (req, res) {
	// User is logged in
	if (req.user) {
	    res.render('home');
	}
	// User not logged in
    res.render('pages/index');
});

// Submit Login Form (post request to '/')
router.post('/twofact', function(req, res) {
	res.render('pages/twofact');
});

// Submit Verification Form (post request to '/')
router.post('/home', function(req, res) {
  res.render('pages/home');
});

// Device/Event Page
router.get('/devices', function(req, res) {
  var fetched = mostRecent(mockData);
  console.log(fetched)
  res.render('pages/device', {
        data: fetched
    });
});

// Mount the router on the app
app.use('/', router);

app.listen(3000, function () {
    console.log('Running on port 3000')
});
