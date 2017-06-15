'use strict';

var express = require("express");
var app = express();
var jsonParser = require("body-parser").json;
var logger = require("morgan");
var mongoose = require("mongoose");
var config = require('./configure/config');

var adminAuthRoutes = express.Router();
var userAuthRoutes = express.Router();


var Page = require("./models/page").Page;
var Available = require("./models/available").Available;
var User = require("./models/user").User;
var jwt = require('jsonwebtoken');


var roomRoutes = require("./routes/roomRoutes");
var pageRoutes = require("./routes/pageRoutes");
var lockedAdminRoutes = require("./routes/lockedAdminRoutes");
var lockedUserRoutes = require("./routes/lockedUserRoutes");


//=====CONFIGURATION=============================
mongoose.connect(config.database); //connect to database
app.set('superSecret', config.secret); //set secret variable
app.set('superSuperSecret', config.super); //set secret variable

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
//5942f613d3804004f852cd4c
//=========================================================

app.get('/setup', function(req, res) {
  // create a sample user
  var nick = new Page({
    username: 'Sarah Heacock',
    password: 'password',
  });

  // save the sample user
  nick.save(function(err, nic) {
    if (err) throw err;

    var roomIDs = nick.rooms.map(function(r){
      return {
        roomID: r._id
      };
    });

    var av = new Available({
      pageID: nic._id,
      free: roomIDs,
    });

    av.save(function(err, a){
      if (err) throw err;
      res.json({ success: true, page: nic, available: a });

    });
  });
});


//========================ADMIN LOGIN====================================
// POST /login
adminAuthRoutes.post('/login', function(req, res, next) {
  if (req.body.username && req.body.password) {
    Page.authenticate(req.body.username, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      }
      else {
        var token = jwt.sign({adminID: user.adminID}, app.get('superSecret'), {
          expiresIn: '1d' //expires in one hour
        });

        res.json({
          admin: true,
          id: token,
          //pageID: user._id
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
adminAuthRoutes.use(function(req, res, next) {
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
  }
  else {
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });
  }
});


//===========================USER LOGIN=========================================
// POST /login
userAuthRoutes.post('/userlogin', function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      }
      else {
        var token = jwt.sign({userID: user.userID}, app.get('superSecret'), {
          expiresIn: '1h' //expires in one hour
        });

        res.json({
          admin: true,
          id: token,
          user: user._id
          //pageID: user._id
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
userAuthRoutes.use(function(req, res, next) {
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
  }
  else {
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });
  }
});

//=================ROUTES=======================================
//ROUTES THAT DO NOT NEED AUTHENTICATION
app.use('/page', pageRoutes);
app.use('/rooms', roomRoutes);

// apply the routes to our application with the prefix /api
app.use("/api", adminAuthRoutes);
// ROUTES THAT NEED ADMIN ATHENTICATION
app.use('/api/admin', lockedAdminRoutes);


app.use('/locked', userAuthRoutes);
// ROUTES THAT NEED USER AUTHENTICATION
app.use('/locked/user', lockedUserRoutes)


//===========================================================
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
