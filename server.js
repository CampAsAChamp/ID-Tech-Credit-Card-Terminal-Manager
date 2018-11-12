const express = require('express');
const app = express();
app.set('view engine', 'ejs');
const router = express.Router();
app.use(express.static('static'));
var session = require('express-session');
var cookieParser = require('cookie-parser');

// TODO: Delete later
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
// End TODO: Delete Later

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
function mostRecent(data, N=30) {
  const dateLabel = "lastHeartbeat";
  return data.sort(function(x, y) {
    const a = new Date(x[dateLabel]), b = new Date(y[dateLabel]);
    return a - b;
  }).slice(N * -1);
}

// Login/Home Page
router.get('/', function (req, res) {
	// User is logged in
  if (req.session && req.session.user) {
	    res.render('pages/home');
	}
	// User not logged in
    res.render('pages/login');
});

router.get('/twofact', function (req, res) {
  res.render('pages/twofact');
})

// Submit Login Form (post request to '/')
router.post('/', function(req, res) {
  req.session.user = {id: "user", password: "pw"};
	res.redirect('/twofact');
});


// Submit Verification Form (post request to '/')
router.post('/twofact', function(req, res) {
  res.redirect('/');
});

// Device/Event Page
router.get('/devices', function(req, res) {
  var fetched = mostRecent(mockData);
  res.render('pages/devices', {
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

// Mount the router on the app
app.use(session({secret: "secret key"}));
app.use('/', router);

app.listen(3000, function () {
    console.log('Running on port 3000')
});
