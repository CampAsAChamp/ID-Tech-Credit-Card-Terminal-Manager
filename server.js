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
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}

// Utility function retrieves most recent N entries
function mostRecent(data, N=5) {
  const dateLabel = "lastHeartbeat";
  return data.sort(function(x, y) {
    const a = new Date(x[dateLabel]), b = new Date(y[dateLabel]);
    return a - b;
  }).slice(N * -1);
}

// Login/Home Page
router.get('/', function (req, res) {
	// User is logged in
  console.log(req.session);

	if (req.session && req.session.user) {
      
	    res.render('pages/home');
	}
	// User not logged in
    res.render('pages/login');
});

router.get('/twofact', function (req, res, next) {
  res.render('pages/twofact');
})

// Submit Login Form (post request to '/')
router.post('/', function(req, res, next) {
  var newUser = {id: "user", password: "pw"};
  req.session.user = newUser;
	res.redirect('/twofact');
});


// Submit Verification Form (post request to '/')
router.post('/twofact', function(req, res, next) {
  var newUser = {id: "user", password: "pw"};
  req.session.user = newUser;
  res.redirect('/');
});

// Device/Event Page
router.get('/devices', function(req, res, next) {
  var fetched = mostRecent(mockData);
  res.render('pages/devices', {
        data: fetched
    });
});

// Profile Page
router.get('/profile', function(req, res, next) {
  res.render('pages/profile');
});

// Logout Current User
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// Mount the router on the app
app.use(session({secret: "secret key"}));
app.use('/', router);

app.listen(3000, function () {
    console.log('Running on port 3000')
});
