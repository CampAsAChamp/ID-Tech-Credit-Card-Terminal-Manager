const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: '9ee4a85f',
    apiSecret: '423HmKFXkOpy0nRX'
});


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
app.use(session({ secret: "secret key",
                  resave: true,
                  saveUninitialized: true
                }));
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

// TODO: Replace Mock Data for users with actual Data
let mockuser = [];
let user = ["Roei.Ovadia", "Josh.Lopez", "Nick.Schneider", "Rohit.Sriram", "Jan.Christian", "Darren.Sjafrudin", "Alana.12345", "Steve.12345", "Aaron.12345"];
for (let i = 0; i < user.length; i++) {
  mockuser[i] = user[i % user.length]
}

// End TODO//mockdata[i][lastHeartbeat]
let months = new Array(12).fill(0);
for (let i = 0; i < mockData.length; ++i) {
  let date = mockData[i].lastHeartbeat;
  months[new Date(date).getMonth()]++;
}

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
  req.session.auth = { fa: req.body.twofa };
  /*if ((req.session.auth.fa).length == 6) {
    return res.redirect('/');
  }*/
  if ((req.session.auth.fa) == two_fact_code || (req.session.auth.fa) == two_fact_default ) {
    return res.redirect('/');
  }


  // let pin = req.body.pin;
  // let requestId = req.body.requestId;

  // nexmo.verify.check({request_id: requestId, code: pin}, (err, result) => {
  //     if(err) {
  //         // handle the error
  //         return res.redirect('/');
  //     } else {
  //         if(result && result.status == '0') { // Success!
  //             // success!
  //             return res.redirect('/'); //take them to home page
  //         } else {
  //             // handle the error - e.g. wrong PIN
  //             return res.redirect('/');
  //         }
  //     }
  // });
});

// Login page
router.get('/login', function (req, res) {
  let status = true;
  return res.render('pages/login', {
     "status": status,
     "username":""
  });
});

const two_fact_code = Math.floor(Math.random() * 999999) + 100000
const two_fact_default = 837412
router.post('/login', function (req, res) {
  req.session.user = { id: req.body.username, password: req.body.password };
  let user_name_and_password = req.session.user.id + "." + req.session.user.password;
  if (validateLogin(user_name_and_password))
  {
    const phoneNumber =  19162188231;//19257195064; //req.body.number; Roei's phone number josh
    //… will send a SMS with a PIN code to the number!

    const from = '18452531040'; //nexmo number

      const text = 'ID TECH Code is '+ two_fact_code;
    nexmo.message.sendSms(from, phoneNumber, text);
    nexmo.verify.request({number: phoneNumber, brand: 'ID TECH', code_length: 6},
      (err, result) => {
        if(err) {
            return res.render('pages/login', {
               "status": true,
               "username": req.session.user.id
            });
        } else {
            console.log('Sent code to ' + phoneNumber);
            let requestId = result.request_id;
            if(result.status == '0') {
                console.log('Sent code to ' + phoneNumber); //josh
                return res.redirect("/twofact?requestId=" + requestId);
            } else {
                console.log('Alternative');
                return res.redirect("/twofact?requestId=" + requestId);
            }
        }
    });
  }
  else
  {
    return res.render('pages/login', {
               "status": false,
               "username": req.session.user.id
            });
  }
});

// FIXME: Checks if credentials match any of our mock users.
// Needs to do actual authentication
function validateLogin(credentials)
{
  return !(mockuser.indexOf(credentials) === -1)
}

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
