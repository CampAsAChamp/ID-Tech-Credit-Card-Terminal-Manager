const express = require('express');
const app = express();
app.set('view engine', 'ejs');
const router = express.Router();

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
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
router.post('/', function(req, res) {
	res.render('pages/home');
});

// Device/Event Page
router.get('/devices', function(req, res) {
	res.render('pages/device')
});

// Mount the router on the app
app.use('/', router);

app.listen(3000, function () {
    console.log('Running on port 3000')
});
