const express = require('express')
const app = express()
const router = express.Router()

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}

router.get('/', function (req, res) {
	// User is logged in
	if (req.user) {
	    res.render('home');
	}
	// User not logged in
    res.render('index');
})

router.post('/', function(req, res) {
	res.render('home');
})

// mount the router on the app
app.use('/', router)

// Will change later to 
app.listen(3000, function () {
    console.log('Running on port 3000')
})

app.set('view engine', 'ejs')
