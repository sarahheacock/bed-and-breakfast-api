'use strict';


var express = require("express");
var app = express();


//var bodyParser = require("body-parser");
var jsonParser = require("body-parser").json;
var logger = require("morgan");

var mongoose = require("mongoose");
var config = require('./configure/config');

var router = express.Router();
var Page = require("./models/page").Page;
var jwt = require('jsonwebtoken');

//var mailRoutes = require("./routes/mailRoutes");
var userRoutes = require("./routes/userRoutes");
var adminRoutes = require("./routes/adminRoutes");
//var bcrypt = require('bcrypt');

//=====CONFIGURATION=============================
mongoose.connect(config.database); //connect to database
app.set('superSecret', config.secret); //set secret variable


// use body parser so we can get info from POST and/or URL parameters
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());
app.use(jsonParser());
app.use(logger("dev"));


var db = mongoose.connection;
db.on("error", function(err){
  console.error("connection error:", err);
});
db.once("open", function(){
  console.log("db connection successful");
});


app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if(req.method === "OPTIONS"){
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    return res.status(200).json({});
  }
  next();
});

//======ROUTES==============================================
//59403bd95f36f802df04179b
//=========================================================
// app.get('/setup', function(req, res) {
//
//   // create a sample user
//   var nick = new Page({
//     username: 'Sarah Heacock',
//     password: 'password',
//   });
//
//   // save the sample user
//   nick.save(function(err) {
//     if (err) throw err;
//
//     console.log('User saved successfully');
//     res.json({ success: true });
//   });
// });

// POST /login
router.post('/login', function(req, res, next) {
  if (req.body.username && req.body.password) {
    Page.authenticate(req.body.username, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      }
      else {
        var token = jwt.sign(user._id, app.get('superSecret'), {
          expiresIn: '1h' //expires in one hour
        });

        res.json({
          admin: true,
          id: token
        });
      }
    });
  }
  else {
    var err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});

// route middleware to verify a token
router.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });

  }
});

//ROUTES THAT DO NOT NEED AUTHENTICATION
app.use('/user', userRoutes);

// apply the routes to our application with the prefix /api
app.use("/api", router);

// ROUTES THAT NEED ATHENTICATION
app.use('/api/admin', adminRoutes);

//==========================================================
//catch 404 and forward to error handler
app.use(function(req, res, next){
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

//Error Handler
app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

//=======START SERVER========================================
var port = process.env.PORT || 8080;

app.listen(port, function(){
  console.log("Express server is listening on port ", port);
});

// 'use strict';
//
// //dependencies
// var express = require("express");
// var app = express();
// var routes = require("./routes");
// var jsonParser = require("body-parser").json;
// var mongoose = require("mongoose");
// var logger = require("morgan");
//
// app.use(logger("dev"));
// app.use(jsonParser());
//
// var port = process.env.PORT || 3000;
//
// mongoose.connect('mongodb://heroku_lt50lh59:13d6h6ct41aaqo63l2o3i9qulg@ds163301.mlab.com:63301/heroku_lt50lh59');
//
//
// var db = mongoose.connection;
//
// db.on("error", function(err){
//   console.error("connection error:", err);
// });
//
// db.once("open", function(){
//   console.log("db connection successful");
// });
//
// app.use(function(req, res, next){
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   if(req.method === "OPTIONS"){
//     res.header("Access-Control-Allow-Methods", "PUT,POST");
//     return res.status(200).json({});
//   }
//   next();
// });
//
// //routes
// app.use("/hotel", routes);
//
// //catch 404 and forward to error handler
// app.use(function(req, res, next){
//   var err = new Error("Not Found");
//   err.status = 404;
//   next(err);
// });
//
// //Error Handler
// app.use(function(err, req, res, next){
//   res.status(err.status || 500);
//   res.json({
//     error: {
//       message: err.message
//     }
//   });
// });
//
// //var port = process.env.PORT || 3000;
//
// app.listen(port, function(){
//   console.log("Express server is listening on port ", port);
// });
