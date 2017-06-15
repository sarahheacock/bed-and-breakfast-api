'use strict';

var bcrypt = require("bcrypt");
var express = require("express");
var lockedUserRoutes = express.Router();
var User = require("../models/user").User;

lockedUserRoutes.param("userID", function(req, res, next, id){
  User.findById(id, function(err, doc){
    if(err) return next(err);
    if(!doc){
      err = new Error("User Not Found");
      err.status = 404;
      return next(err);
    }
    req.user = doc;
    return next();
  });
})

lockedUserRoutes.param("email", function(req, res, next, id){
  //User.findById(id, function(err, doc){
  User.findOne({email: id}).exec(function(err, doc){
    if(err) return next(err);
    if(!doc){
      err = new Error("Email Not Found");
      err.status = 404;
      return next(err);
    }
    req.user = doc;
    return next();
  });
});

lockedUserRoutes.param("password", function(req, res, next, id){
  bcrypt.compare(id, req.user.password, function(error, result){
    if(result === false){
      var err = new Error("Incorrect Password");
      err.status = 404;
      return next(err);
    }
    return next();
  });
});

lockedUserRoutes.param("upcomingID", function(req,res,next,id){
  req.upcoming = req.user.upcoming.id(id);
  if(!req.upcoming){
    err = new Error("Not Found");
    err.status = 404;
    return next(err);
  }
  next();
});

//============================================================

//get all users
lockedUserRoutes.get("/", function(req, res){
  User.find({})
    .sort({createdAt: -1})
    .exec(function(err, user){
      if(err) return next(err);
      res.json(user);
    });
});

//create new user
lockedUserRoutes.post("/", function(req, res, next){
  var user = new User(req.body);
  user.save(function(err, user){
    if(err) return next(err);
    res.status(201);
    res.json(user);
  });
});

lockedUserRoutes.get('/:userID', function(req, res, next){
  res.json(req.user);
});

//get user information
lockedUserRoutes.get("/authenticate/:email/:password", function(req, res, next){
  res.json(req.user);
});

//make new reservation
lockedUserRoutes.post("/:userID/upcoming", function(req, res, next){
  req.user.upcoming.push(req.body);
  req.user.save(function(err, user){
    if(err) return next(err);
    res.status(201);
    res.json(user);
  });
});


lockedUserRoutes.get("/:userID/upcoming/:upcomingID", function(req, res){
  res.json(req.upcoming);
});

//cancel reservation
lockedUserRoutes.delete("/:userID/upcoming/:upcomingID", function(req, res){
  req.upcoming.remove(function(err){
    req.user.save(function(err, user){
      if(err) return next(err);
      res.json(user);
    });
  });
});




module.exports = lockedUserRoutes;
